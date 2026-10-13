// Explicitly invoked integration tests use only tagged temporary records and clean them up.
process.env.NODE_ENV = 'test';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { createRequire } = require('node:module');
const path = require('node:path');
const requireServer = createRequire(path.resolve(__dirname, '../server/package.json'));
const mongoose = requireServer('mongoose');
const { env } = require('../server/dist/config/env');
const { Admin } = require('../server/dist/models/Admin');
const { Inquiry } = require('../server/dist/models/Inquiry');
const { QuotationRequest } = require('../server/dist/models/QuotationRequest');
const { Appointment } = require('../server/dist/models/Appointment');
const { BookingLock } = require('../server/dist/models/BookingLock');
const { ClientProject } = require('../server/dist/models/ClientProject');
const { Upload } = require('../server/dist/models/Upload');
const { Notification } = require('../server/dist/models/Notification');
const { ChatConversation } = require('../server/dist/models/ChatConversation');
const { Service } = require('../server/dist/models/Service');
const { BlogPost } = require('../server/dist/models/BlogPost');
const { Setting } = require('../server/dist/models/Setting');
const { hashToken, newToken } = require('../server/dist/utils/security');
const { reserveAppointment } = require('../server/dist/services/bookingReservations');
const prefix = `integration-${randomUUID()}`,
  email = `${prefix}@example.test`;
let server,
  base,
  cookie,
  userCookie,
  inquiry,
  quotation,
  project,
  trackingToken,
  attachment,
  booking,
  manageToken,
  settings,
  service,
  article;
const created = [];
const remember = (model, id) => {
  created.push([model, id]);
  return id;
};
async function request(method, url, body, auth = cookie, headers = {}) {
  const response = await fetch(base + url, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(auth ? { Cookie: auth } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = raw;
  }
  return { status: response.status, data, headers: response.headers };
}
before(async () => {
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  await Promise.all(
    [
      Admin,
      Inquiry,
      QuotationRequest,
      Appointment,
      BookingLock,
      ClientProject,
      Upload,
      Notification,
      Service,
      BlogPost,
    ].map((model) => model.init()),
  );
  settings = await Setting.findOne();
  assert.ok(settings, 'Seed the application before running database tests.');
  const app = require('../server/dist/server').default;
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  for (const [model, id] of created.reverse()) await model.deleteOne({ _id: id });
  await BookingLock.deleteMany({
    appointmentId: { $in: created.filter(([model]) => model === Appointment).map(([, id]) => id) },
  });
  await Notification.deleteMany({
    $or: [{ to: email }, { referenceId: { $in: created.map(([, id]) => String(id)) } }],
  });

  await mongoose.disconnect();
});
test('database health and login work with an HttpOnly session', async () => {
  assert.equal((await request('GET', '/health', null, '')).status, 200);
  const response = await request(
    'POST',
    '/api/auth/login',
    { email: env.DEFAULT_ADMIN_EMAIL, password: env.DEFAULT_ADMIN_PASSWORD },
    '',
  );
  assert.equal(response.status, 200);
  assert.match(response.headers.get('set-cookie'), /HttpOnly/i);
  cookie = response.headers.get('set-cookie').split(';')[0];
  assert.equal((await request('GET', '/api/auth/me')).status, 200);
});
test('protected endpoints and malformed queries are rejected', async () => {
  assert.equal((await request('GET', '/api/inquiries', null, '')).status, 401);
  assert.equal((await request('GET', '/api/inquiries?limit=100000')).status, 400);
  assert.equal((await request('GET', '/api/inquiries?search[$ne]=x')).status, 400);
  assert.equal(
    (
      await request(
        'POST',
        '/api/inquiries',
        { name: prefix, email: {}, subject: 'test', message: 'test' },
        '',
      )
    ).status,
    400,
  );
  assert.equal(
    (await request('POST', '/api/inquiries', {}, '', { Origin: 'https://untrusted.example' }))
      .status,
    403,
  );
});
test('contact submission persists extended fields and duplicate keys do not create duplicate records', async () => {
  const input = {
    name: '=1+1',
    email,
    subject: prefix,
    message: 'Project brief, with\nnew lines',
    businessType: 'Bakery',
    service: 'Business Websites',
    budget: '500',
    idempotencyKey: prefix,
  };
  const response = await request('POST', '/api/inquiries', input, '');
  assert.equal(response.status, 201);
  inquiry = remember(Inquiry, response.data.data.id);
  assert.equal((await request('POST', '/api/inquiries', input, '')).status, 200);
  assert.equal(await Inquiry.countDocuments({ idempotencyKey: prefix }), 1);
  assert.equal((await Inquiry.findById(inquiry)).businessType, 'Bakery');
  const csv = await request('GET', `/api/inquiries/export?search=${prefix}`);
  assert.equal(csv.status, 200);
  assert.match(csv.data, /"'=1\+1"/);
});
test('role enforcement distinguishes owners from administrators', async () => {
  const password = newToken();
  const result = await request('POST', '/api/auth/users', {
    email,
    password,
    fullName: prefix,
    role: 'admin',
  });
  assert.equal(result.status, 201);
  remember(Admin, result.data.data.id);
  const login = await request('POST', '/api/auth/login', { email, password }, '');
  assert.equal(login.status, 200);
  userCookie = login.headers.get('set-cookie').split(';')[0];
  assert.equal((await request('GET', '/api/auth/users', null, userCookie)).status, 403);
  const { _id, createdAt, updatedAt, __v, ...payload } = settings.toObject();
  assert.equal((await request('PUT', '/api/settings', payload, userCookie)).status, 403);
  assert.equal((await request('GET', '/api/inquiries', null, userCookie)).status, 200);
});
test('service drafts stay private and can be published', async () => {
  const result = await request('POST', '/api/services', {
    title: prefix,
    shortDescription: 'A draft',
    isPublished: false,
  });
  assert.equal(result.status, 201);
  service = remember(Service, result.data.data._id);
  assert.equal(
    (await request('GET', `/api/services/${result.data.data.slug}`, null, '')).status,
    404,
  );
  assert.equal(
    (await request('PUT', `/api/services/${service}`, { isPublished: true })).status,
    200,
  );
  assert.equal(
    (await request('GET', `/api/services/${result.data.data.slug}`, null, '')).status,
    200,
  );
  const page = await request('GET', `/api/services/admin/all?page=1&limit=1&search=${prefix}`);
  assert.equal(page.data.meta.total, 1);
});
test('files validate content, require authorization for publication and protect private documents', async () => {
  const payload = {
    filename: 'brief.pdf',
    mime: 'application/pdf',
    base64: Buffer.from('%PDF-1.4\nIntegration fixture').toString('base64'),
    visibility: 'private',
  };
  const result = await request('POST', '/api/files', payload, '');
  assert.equal(result.status, 201);
  attachment = result.data.data;
  remember(Upload, attachment.fileId);
  assert.equal((await request('GET', `/api/files/${attachment.fileId}`, null, '')).status, 401);
  assert.equal((await request('GET', `/api/files/${attachment.fileId}`)).status, 200);
  assert.equal(
    (
      await request(
        'POST',
        '/api/files',
        { ...payload, base64: Buffer.from('Executable').toString('base64') },
        '',
      )
    ).status,
    400,
  );
  const image = {
    filename: 'image.png',
    mime: 'image/png',
    base64: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).toString('base64'),
    visibility: 'public',
  };
  assert.equal((await request('POST', '/api/files', image, '')).status, 401);
  const published = await request('POST', '/api/files', image);
  assert.equal(published.status, 201);
  remember(Upload, published.data.data.fileId);
  assert.equal(
    (await request('GET', `/api/files/${published.data.data.fileId}`, null, '')).status,
    200,
  );
});
test('quotation attachments are claimed transactionally and leads convert only once', async () => {
  const payload = {
    name: prefix,
    email,
    projectType: 'Website',
    budgetRange: '500',
    timeline: 'One month',
    description: prefix,
    idempotencyKey: `${prefix}-quote`,
    attachments: [{ fileId: attachment.fileId, token: attachment.token }],
  };
  const result = await request('POST', '/api/quotations', payload, '');
  assert.equal(result.status, 201);
  quotation = remember(QuotationRequest, result.data.data.id);
  assert.equal(String((await Upload.findById(attachment.fileId)).owner), String(quotation));
  assert.equal((await request('POST', '/api/quotations', payload, '')).status, 200);
  const converted = await request('POST', '/api/client-projects', {
    sourceType: 'quotation',
    sourceId: String(quotation),
  });
  assert.equal(converted.status, 201);
  project = remember(ClientProject, converted.data.data.project._id);
  trackingToken = converted.data.data.token;
  assert.equal(
    (
      await request('POST', '/api/client-projects', {
        sourceType: 'quotation',
        sourceId: String(quotation),
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await request('PUT', `/api/client-projects/${project}`, {
        status: 'in_progress',
        update: 'Design approved',
        proposal: 'Build five pages',
        quoteAmount: 500,
      })
    ).status,
    200,
  );
  const tracked = await request('POST', '/api/client-projects/track', { token: trackingToken }, '');
  assert.equal(tracked.data.data.status, 'in_progress');
  assert.equal(tracked.data.data.quoteAmount, 500);
  assert.equal(tracked.data.data.tokenHash, undefined);
  assert.equal(
    (
      await request('GET', `/api/files/${attachment.fileId}`, null, '', {
        'X-Project-Token': trackingToken,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request('GET', `/api/files/${attachment.fileId}`, null, '', {
        'X-Project-Token': newToken(),
      })
    ).status,
    403,
  );
});
test('revoked tracking codes stop granting access', async () => {
  const rotated = await request('POST', `/api/client-projects/${project}/tracking-code`);
  assert.equal(rotated.status, 200);
  assert.equal(
    (await request('POST', '/api/client-projects/track', { token: trackingToken }, '')).status,
    404,
  );
  trackingToken = rotated.data.data.token;
  assert.equal(
    (await request('POST', '/api/client-projects/track', { token: trackingToken }, '')).status,
    200,
  );
});
test('concurrent bookings allow one reservation and validate interval duration', async () => {
  let date = new Date('2099-01-05T00:00:00Z');
  while (!settings.businessHours.workDays.includes(date.getUTCDay() || 7))
    date.setUTCDate(date.getUTCDate() + 1);
  const dateStr = date.toISOString().slice(0, 10);
  const slots = (
    await request('GET', `/api/appointments/available-slots?date=${dateStr}`, null, '')
  ).data.data.slots.filter((slot) => slot.isAvailable);
  assert.ok(slots.length >= 2);
  const payload = {
    clientName: prefix,
    clientEmail: email,
    serviceType: 'Test consultation',
    appointmentDate: dateStr,
    startTime: slots[0].startTime,
    endTime: slots[0].endTime,
  };
  assert.equal(
    (await request('POST', '/api/appointments', { ...payload, endTime: '23:59' }, '')).status,
    409,
  );
  const results = await Promise.all([
    request('POST', '/api/appointments', { ...payload, idempotencyKey: `${prefix}-a` }, ''),
    request('POST', '/api/appointments', { ...payload, idempotencyKey: `${prefix}-b` }, ''),
  ]);
  assert.deepEqual(results.map((value) => value.status).sort(), [201, 409]);
  const winner = results.find((value) => value.status === 201).data.data;
  booking = remember(Appointment, winner._id);
  manageToken = winner.manageToken;
  assert.equal(winner.manageTokenHash, undefined);
  assert.ok(await BookingLock.countDocuments({ appointmentId: booking }));
  const rescheduled = await request(
    'POST',
    '/api/appointments/manage',
    {
      token: manageToken,
      action: 'reschedule',
      appointmentDate: dateStr,
      startTime: slots[1].startTime,
      endTime: slots[1].endTime,
    },
    '',
  );
  assert.equal(rescheduled.status, 200);
  assert.equal(
    await BookingLock.countDocuments({
      appointmentId: booking,
      minute: Number(slots[0].startTime.slice(0, 2)) * 60 + Number(slots[0].startTime.slice(3)),
    }),
    0,
  );
});
test('clients can cancel with the private code and cancellation releases reservations', async () => {
  assert.equal(
    (await request('POST', '/api/appointments/manage', { token: newToken(), action: 'cancel' }, ''))
      .status,
    404,
  );
  assert.equal(
    (
      await request(
        'POST',
        '/api/appointments/manage',
        { token: manageToken, action: 'cancel' },
        '',
      )
    ).status,
    200,
  );
  assert.equal(await BookingLock.countDocuments({ appointmentId: booking }), 0);
  assert.equal(
    (
      await request(
        'POST',
        '/api/appointments/manage',
        { token: manageToken, action: 'reschedule' },
        '',
      )
    ).status,
    409,
  );
});
test('expired bookings cannot be changed by a client', async () => {
  const token = newToken();
  const record = await Appointment.create({
    clientName: prefix,
    clientEmail: email,
    serviceType: 'Test',
    appointmentDate: '2001-01-01',
    startTime: '09:00',
    endTime: '09:30',
    manageTokenHash: hashToken(token),
  });
  remember(Appointment, record._id);
  assert.equal(
    (await request('POST', '/api/appointments/manage', { token, action: 'cancel' }, '')).status,
    409,
  );
});
test('articles store SEO metadata and sitemap excludes unpublished content', async () => {
  const result = await request('POST', '/api/blog', {
    title: prefix,
    summary: 'Test description',
    content: 'Article body',
    isPublished: false,
    seoTitle: 'Custom title',
    seoDescription: 'Custom description',
  });
  assert.equal(result.status, 201);
  article = remember(BlogPost, result.data.data._id);
  assert.equal((await BlogPost.findById(article)).seoTitle, 'Custom title');
  let sitemap = await request('GET', '/sitemap.xml', null, '');
  assert.ok(!sitemap.data.includes(`/blog/${result.data.data.slug}`));
  await request('PUT', `/api/blog/${article}`, { isPublished: true });
  sitemap = await request('GET', '/sitemap.xml', null, '');
  assert.ok(sitemap.data.includes(`/blog/${result.data.data.slug}`));
  assert.match((await request('GET', '/robots.txt', null, '')).data, /Disallow: \/track/);
});
test('notifications persist as deferred rather than claiming delivery', async () => {
  const response = await request('GET', '/api/notifications?page=1&limit=5');
  assert.equal(response.status, 200);
  assert.ok(response.data.meta.total >= 1);
  const rows = await Notification.find({ to: email });
  assert.ok(rows.length);
  assert.ok(rows.every((record) => record.status === 'deferred'));
});
test('chat initialization is atomic and two-way messages retain the customer email', async () => {
  const sessionId = newToken();
  assert.equal((await request('POST', '/api/chat/session', { sessionId }, '')).status, 400);
  const payload = { sessionId, clientName: prefix, clientEmail: email };
  const replies = await Promise.all([
    request('POST', '/api/chat/session', payload, ''),
    request('POST', '/api/chat/session', payload, ''),
  ]);
  assert.ok(replies.every((reply) => reply.status === 200));
  const record = await ChatConversation.findOne({ sessionId });
  remember(ChatConversation, record._id);
  assert.equal(await ChatConversation.countDocuments({ sessionId }), 1);
  assert.equal(record.clientEmail, email);
  assert.equal(
    (await request('POST', `/api/chat/${sessionId}/message`, { message: 'Hello studio' }, ''))
      .status,
    201,
  );
  assert.equal(
    (await request('POST', `/api/chat/admin/${sessionId}/reply`, { message: 'Hello client' }))
      .status,
    201,
  );
  const messages = (await request('GET', `/api/chat/${sessionId}/messages`, null, '')).data.data;
  assert.equal(messages.at(-1).message, 'Hello client');
});
