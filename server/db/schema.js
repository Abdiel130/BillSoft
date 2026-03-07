const {
    mysqlTable, varchar, int, timestamp, text, decimal, json, mysqlEnum
} = require('drizzle-orm/mysql-core');

const companyTypeEnum = ['CLIENT', 'EXTERNAL'];
const billStatusEnum = ['draft', 'stamped', 'canceled'];
const cfdiTypeEnum = ['I', 'E', 'P', 'T', 'N'];
const taxTypeEnum = ['traslado', 'retencion'];

// 2. Tablas de Catálogos / Base
const taxRegimes = mysqlTable('tax_regimes', {
    id: varchar('id', { length: 3 }).primaryKey(),
    description: varchar('description', { length: 100 })
});

const paymentForms = mysqlTable('payment_forms', {
    id: varchar('id', { length: 2 }).primaryKey(),
    description: varchar('description', { length: 100 })
});

const paymentMethods = mysqlTable('payment_methods', {
    id: varchar('id', { length: 2 }).primaryKey(),
    description: varchar('description', { length: 100 })
});

const cfdiUses = mysqlTable('cfdi_uses', {
    id: varchar('id', { length: 2 }).primaryKey(),
    description: varchar('description', { length: 100 })
});

// 3. Tablas Principales
const user = mysqlTable('user', {
    id: int('id').autoincrement().primaryKey(),
    username: varchar('username', { length: 100 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    name: varchar('name', { length: 100 }),
    lastname: varchar('lastname', { length: 100 }),
    rol: int('rol'),
    createdAt: timestamp('created_at').defaultNow(),
    deletedAt: timestamp('deleted_at')
});

const companies = mysqlTable('companies', {
    id: int('id').autoincrement().primaryKey(),
    rfc: varchar('rfc', { length: 14 }).unique().notNull(),
    legalName: varchar('legal_name', { length: 255 }).notNull(),
    zipCode: varchar('zip_code', { length: 6 }).notNull(),
    nickname: varchar('nickname', { length: 100 }),
    taxRegimeId: varchar('tax_regime_id', { length: 3 }).references(() => taxRegimes.id),
    type: mysqlEnum('type', companyTypeEnum).notNull(),
    createdAt: timestamp('create_at').defaultNow(),
    deletedAt: timestamp('deleted_at')
});

const companyCredentials = mysqlTable('company_credentials', {
    id: int('id').autoincrement().primaryKey(),
    companyId: int('company_id').references(() => companies.id),
    ciec: text('ciec').notNull(),
    fielPassword: text('fiel_password'),
    certificatePath: varchar('certificate_path', { length: 255 }),
    privateKeyPath: varchar('private_key_path', { length: 255 })
});

const companyClients = mysqlTable('company_clients', {
    id: int('id').autoincrement().primaryKey(),
    clientId: int('client_id').references(() => companies.id),
    externalId: int('external_id').references(() => companies.id)
});

// 4. Tablas Operativas (Facturación)
const bill = mysqlTable('bill', {
    id: int('id').autoincrement().primaryKey(),
    uuid: varchar('uuid', { length: 40 }).unique(),
    issuerId: int('issuer_id').references(() => companies.id),
    receiverId: int('receiver_id').references(() => companies.id),
    folio: varchar('folio', { length: 20 }),
    emitDate: timestamp('emit_date', { mode: 'date' }),
    subtotal: decimal('subtotal', { precision: 15, scale: 2 }),
    total: decimal('total', { precision: 15, scale: 2 }),
    totalTax: decimal('total_tax', { precision: 15, scale: 2 }),
    balance: decimal('balance', { precision: 15, scale: 2 }),
    exchangeRate: varchar('exchange_rate', { length: 100 }),
    currency: varchar('currency', { length: 3 }),
    paymentMethodId: varchar('payment_method_id', { length: 2 }).references(() => paymentMethods.id),
    paymentFormId: varchar('payment_form_id', { length: 2 }).references(() => paymentForms.id),
    cfdiUseId: varchar('cfdi_use_id', { length: 2 }).references(() => cfdiUses.id),
    status: mysqlEnum('status', billStatusEnum),
    cfdiType: mysqlEnum('cfdi_type', cfdiTypeEnum),
    xmlPath: text('xml_path'),
    registerAt: timestamp('register_at').defaultNow(),
    canceledAt: timestamp('canceled_at', { mode: 'date' })
});

const billItems = mysqlTable('bill_items', {
    id: int('id').autoincrement().primaryKey(),
    billId: int('bill_id').references(() => bill.id),
    satProductCode: varchar('sat_product_code', { length: 12 }),
    satUnitCode: varchar('sat_unit_code', { length: 6 }),
    sku: varchar('sku', { length: 50 }),
    description: text('description'),
    quantity: decimal('quantity', { precision: 16, scale: 6 }),
    unitValue: decimal('unit_value', { precision: 16, scale: 6 }),
    discount: decimal('discount', { precision: 16, scale: 6 }),
    amount: decimal('amount', { precision: 16, scale: 6 }),
    taxObject: varchar('tax_object', { length: 2 })
});

const billTax = mysqlTable('bill_tax', {
    id: int('id').autoincrement().primaryKey(),
    itemId: int('item_id').references(() => billItems.id),
    taxType: mysqlEnum('tax_type', taxTypeEnum),
    taxCode: varchar('tax_code', { length: 4 }),
    baseAmount: decimal('base_amount', { precision: 16, scale: 6 }),
    factorType: varchar('factor_type', { length: 10 }),
    rate: decimal('rate', { precision: 10, scale: 6 }),
    amount: decimal('amount', { precision: 16, scale: 6 })
});

// 5. Pagos y Relaciones
const payments = mysqlTable('payments', {
    id: int('id').autoincrement().primaryKey(),
    companyId: int('company_id').references(() => companies.id),
    clientId: int('client_id').references(() => companies.id),
    paymentDate: timestamp('payment_date', { mode: 'date' }),
    totalAmount: decimal('total_amount', { precision: 15, scale: 2 }),
    paymentFormId: varchar('payment_form_id', { length: 2 }).references(() => paymentForms.id),
    currency: varchar('currency', { length: 3 })
});

const paymentRelated = mysqlTable('payment_related', {
    id: int('id').autoincrement().primaryKey(),
    paymentId: int('payment_id').references(() => payments.id),
    billId: int('bill_id').references(() => bill.id),
    partialNum: int('partial_num'),
    previousBalance: decimal('previous_balance', { precision: 16, scale: 6 }),
    amountPaid: decimal('amount_paid', { precision: 16, scale: 6 }),
    pendingPaid: decimal('pending_paid', { precision: 16, scale: 6 }),
    taxBreakdown: json('tax_breakdown')
});

module.exports = {
    taxRegimes, paymentForms, paymentMethods, cfdiUses,
    user, companies, companyCredentials, companyClients,
    bill, billItems, billTax, payments, paymentRelated
};