const demoClients = [
  { id: 'CLI-001', type: 'company', name: 'Nativa Studio', email: 'hola@nativastudio.co', phone: '+503 7150 2241', document: '0614-250991-102-3', city: 'San Salvador', address: 'Colonia Escalón', status: 'recurring', lastActivity: 'Hoy, 10:42 a. m.', orders: 8, tags: 'empresa, recurrente', notes: 'Colecciones para equipo creativo.' },
  { id: 'CLI-002', type: 'person', name: 'Andrés Salazar', email: 'andres.salazar@gmail.com', phone: '+503 7000 0912', document: '', city: 'Santa Tecla', address: 'Santa Tecla', status: 'active', lastActivity: 'Ayer, 4:18 p. m.', orders: 2, tags: 'camisas', notes: 'Prefiere contacto por WhatsApp.' },
  { id: 'CLI-003', type: 'company', name: 'Cima Running Club', email: 'admin@cimarunning.com', phone: '+503 7422 7810', document: '0614-180822-101-5', city: 'San Salvador', address: 'Colonia San Benito', status: 'active', lastActivity: '12 sep, 9:05 a. m.', orders: 4, tags: 'deportes, uniformes', notes: 'Pedido anual de uniformes deportivos.' },
  { id: 'CLI-004', type: 'person', name: 'Laura Méndez', email: 'laura.mendez@gmail.com', phone: '+503 7092 6104', document: '', city: 'Antiguo Cuscatlán', address: 'Antiguo Cuscatlán', status: 'prospect', lastActivity: '10 sep, 2:30 p. m.', orders: 0, tags: 'prospecto, sublimación', notes: 'Solicitó muestra de sublimación creativa.' },
  { id: 'CLI-005', type: 'company', name: 'Grupo Horizonte', email: 'compras@horizonte.com', phone: '+503 7154 1902', document: '0614-090522-103-8', city: 'San Salvador', address: 'Colonia Flor Blanca', status: 'inactive', lastActivity: '22 ago, 11:12 a. m.', orders: 3, tags: 'uniformes', notes: 'Revisar en próxima temporada.' }
];

const storedClients = JSON.parse(localStorage.getItem('da-clients'));
const clients = (storedClients || demoClients).map((client) => ({ ...client, phone: client.phone?.replace(/^\+57\b/, '+503') }));
const state = { clients, editingId: null };
const elements = {
  table: document.querySelector('#clientTableBody'),
  empty: document.querySelector('#emptyState'),
  search: document.querySelector('#searchInput'),
  status: document.querySelector('#statusFilter'),
  clear: document.querySelector('#clearFilter'),
  total: document.querySelector('#totalClients'),
  active: document.querySelector('#activeClients'),
  newClients: document.querySelector('#newClients'),
  resultCount: document.querySelector('#resultCount'),
  navCount: document.querySelector('#navClientCount'),
  drawer: document.querySelector('#clientDrawer'),
  backdrop: document.querySelector('#drawerBackdrop'),
  form: document.querySelector('#clientForm'),
  toast: document.querySelector('#toast')
};

const labels = { active: 'Activo', prospect: 'Prospecto', recurring: 'Recurrente', inactive: 'Inactivo' };
const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function initials(name) {
  return name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function avatarClass(index) {
  return ['yellow', 'blue', 'pink'][index % 3];
}

function render() {
  const query = elements.search.value.trim().toLowerCase();
  const status = elements.status.value;
  const filtered = state.clients.filter((client) => {
    const matchesSearch = !query || [client.name, client.email, client.phone, client.document, client.city].some((value) => value.toLowerCase().includes(query));
    return matchesSearch && (status === 'all' || client.status === status);
  });

  elements.table.innerHTML = filtered.map((client, index) => `<tr data-id="${client.id}">
    <td><input type="checkbox" aria-label="Seleccionar ${client.name}"></td>
    <td><div class="client-cell"><span class="client-avatar ${avatarClass(index)}">${initials(client.name)}</span><div><strong>${client.name}</strong><small>${client.type === 'company' ? 'Empresa' : 'Persona natural'}</small></div></div></td>
    <td><div class="contact-cell">${client.email}<br>${client.phone}</div></td>
    <td><span class="status-pill ${client.status}">${labels[client.status]}</span></td>
    <td>${client.lastActivity}</td>
    <td>${client.orders}</td>
    <td><button class="row-action" type="button" aria-label="Abrir ${client.name}" data-open-client="${client.id}">···</button></td>
  </tr>`).join('');

  elements.empty.hidden = filtered.length > 0;
  elements.resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'cliente' : 'clientes'}`;
  elements.total.textContent = state.clients.length;
  elements.active.textContent = state.clients.filter((client) => client.status === 'active' || client.status === 'recurring').length;
  elements.newClients.textContent = Math.min(state.clients.length, 3);
  elements.navCount.textContent = state.clients.length;
  elements.clear.hidden = !query && status === 'all';
  document.querySelector('#filterCount').textContent = status === 'all' ? '' : '1';
}

function fillForm(client = null) {
  state.editingId = client?.id || null;
  document.querySelector('#drawerTitle').textContent = client ? 'Editar cliente' : 'Nuevo cliente';
  document.querySelector('#profileName').textContent = client?.name || 'Nuevo cliente';
  document.querySelector('#profileType').textContent = client ? (client.type === 'company' ? 'Empresa' : 'Persona natural') : 'Persona natural';
  document.querySelector('#profileAvatar').textContent = initials(client?.name || 'Nuevo Cliente');
  document.querySelector('#profileStatus').textContent = labels[client?.status || 'active'];
  document.querySelector('#profileStatus').className = `status-pill ${client?.status || 'active'}`;
  document.querySelector('#activityCount').textContent = client?.orders || 0;
  document.querySelector('#relatedCount').textContent = client?.orders || 0;
  document.querySelector('#clientId').value = client?.id || '';
  document.querySelector('#clientType').value = client?.type || 'person';
  document.querySelector('#clientStatus').value = client?.status || 'active';
  document.querySelector('#clientName').value = client?.name || '';
  document.querySelector('#clientEmail').value = client?.email || '';
  document.querySelector('#clientPhone').value = client?.phone || '';
  document.querySelector('#clientDocument').value = client?.document || '';
  document.querySelector('#clientCity').value = client?.city || '';
  document.querySelector('#clientAddress').value = client?.address || '';
  document.querySelector('#clientTags').value = client?.tags || '';
  document.querySelector('#clientNotes').value = client?.notes || '';
  document.querySelector('#duplicateWarning').hidden = true;
}

function openDrawer(client = null) {
  fillForm(client);
  elements.drawer.classList.add('open');
  elements.drawer.setAttribute('aria-hidden', 'false');
  elements.backdrop.hidden = false;
  document.body.classList.add('drawer-open');
  setTimeout(() => document.querySelector('#clientName').focus(), 200);
}

function closeDrawer() {
  elements.drawer.classList.remove('open');
  elements.drawer.setAttribute('aria-hidden', 'true');
  elements.backdrop.hidden = true;
  document.body.classList.remove('drawer-open');
}

function saveClients() {
  localStorage.setItem('da-clients', JSON.stringify(state.clients));
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  setTimeout(() => elements.toast.classList.remove('show'), 3000);
}

document.querySelector('#newClientButton').addEventListener('click', () => openDrawer());
document.querySelector('#drawerClose').addEventListener('click', closeDrawer);
document.querySelector('#cancelButton').addEventListener('click', closeDrawer);
elements.backdrop.addEventListener('click', closeDrawer);
elements.search.addEventListener('input', render);
elements.status.addEventListener('change', render);
document.querySelector('#clearFilter').addEventListener('click', () => { elements.search.value = ''; elements.status.value = 'all'; render(); });

elements.table.addEventListener('click', (event) => {
  const button = event.target.closest('[data-open-client]');
  if (!button) return;
  openDrawer(state.clients.find((client) => client.id === button.dataset.openClient));
});

document.querySelector('#clientStatus').addEventListener('change', (event) => {
  document.querySelector('#profileStatus').textContent = labels[event.target.value];
  document.querySelector('#profileStatus').className = `status-pill ${event.target.value}`;
});
document.querySelector('#clientName').addEventListener('input', (event) => { document.querySelector('#profileName').textContent = event.target.value || 'Nuevo cliente'; document.querySelector('#profileAvatar').textContent = initials(event.target.value || 'Nuevo Cliente'); });

elements.form.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.querySelector('#clientEmail').value.trim().toLowerCase();
  const phone = document.querySelector('#clientPhone').value.trim();
  const duplicate = state.clients.find((client) => client.id !== state.editingId && (client.email.toLowerCase() === email || client.phone === phone));
  if (duplicate) { document.querySelector('#duplicateWarning').hidden = false; return; }
  const existing = state.clients.find((client) => client.id === state.editingId);
  const client = { id: state.editingId || `CLI-${String(state.clients.length + 1).padStart(3, '0')}`, type: document.querySelector('#clientType').value, status: document.querySelector('#clientStatus').value, name: document.querySelector('#clientName').value.trim(), email, phone, document: document.querySelector('#clientDocument').value.trim(), city: document.querySelector('#clientCity').value.trim(), address: document.querySelector('#clientAddress').value.trim(), tags: document.querySelector('#clientTags').value.trim(), notes: document.querySelector('#clientNotes').value.trim(), lastActivity: existing?.lastActivity || `Hoy, ${new Date().toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })}`, orders: existing?.orders || 0 };
  if (existing) state.clients = state.clients.map((item) => item.id === state.editingId ? client : item); else state.clients.unshift(client);
  saveClients(); render(); closeDrawer(); showToast(existing ? 'Cliente actualizado correctamente.' : 'Cliente creado correctamente.');
});

document.querySelector('#exportButton').addEventListener('click', () => {
  const header = 'Nombre,Tipo,Correo,Telefono,Estado,Ciudad,Pedidos';
  const rows = state.clients.map((client) => [client.name, client.type, client.email, client.phone, labels[client.status], client.city, client.orders].map((value) => `"${value}"`).join(','));
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'clientes-da.csv'; link.click(); URL.revokeObjectURL(link.href); showToast('Directorio exportado en formato CSV.');
});

const sidebar = document.querySelector('#sidebar');
document.querySelector('.mobile-menu').addEventListener('click', (event) => { const open = sidebar.classList.toggle('open'); event.currentTarget.setAttribute('aria-expanded', String(open)); });
document.querySelector('.sidebar-close').addEventListener('click', () => sidebar.classList.remove('open'));

document.querySelector('#clientType').addEventListener('change', (event) => { document.querySelector('#profileType').textContent = event.target.value === 'company' ? 'Empresa' : 'Persona natural'; });

render();
