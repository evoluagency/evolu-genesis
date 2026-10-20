/** Existing Company information row, shared by the preview and private hosts.
 * Presentation only: callers must authenticate and validate scope/permissions.
 * Never imports a provider, fixture, network client or operational command.
 */
export function assertCnpjIdentity(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("CNPJ_IDENTITY_UNAVAILABLE");
    }
    const item = value;
    if (typeof item.cnpjId !== "string" || !item.cnpjId ||
        typeof item.cnpj !== "string" || !/^[0-9A-Z]{12}[0-9]{2}$/.test(item.cnpj) ||
        typeof item.legalName !== "string" || !item.legalName.trim() ||
        (item.state !== undefined && (typeof item.state !== "string" || !/^[A-Z]{2}$/.test(item.state))) ||
        (item.establishmentType !== undefined &&
            item.establishmentType !== "head_office" && item.establishmentType !== "branch")) {
        throw new Error("CNPJ_IDENTITY_UNAVAILABLE");
    }
}
export function assertCompanyIdentity(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("COMPANY_IDENTITY_UNAVAILABLE");
    }
    const item = value;
    if (typeof item.companyId !== "string" || !item.companyId ||
        typeof item.tenantId !== "string" || !item.tenantId ||
        typeof item.legalName !== "string" || !item.legalName.trim() ||
        (item.tradeName !== undefined && typeof item.tradeName !== "string")) {
        throw new Error("COMPANY_IDENTITY_UNAVAILABLE");
    }
}
// Existing Company name presentation, shared with the preview header.
export function companyIdentityName(company) {
    assertCompanyIdentity(company);
    return company.tradeName || company.legalName;
}
export function renderCnpjIdentity(host, item, locale = "pt", context) {
    host.replaceChildren();
    const doc = host.ownerDocument;
    if (item === null) {
        const notice = doc.createElement("p");
        notice.setAttribute("role", "status");
        notice.textContent = locale === "en"
            ? "Establishment information unavailable."
            : "Informações do estabelecimento indisponíveis.";
        host.appendChild(notice);
        return;
    }
    assertCnpjIdentity(item);
    if (context) {
        if (context.kind !== "company" && context.kind !== "group") {
            throw new Error("COMPANY_IDENTITY_UNAVAILABLE");
        }
        assertCompanyIdentity(context.company);
    }
    const row = doc.createElement("div");
    row.className = "ux-cnpj-identity";
    row.setAttribute("data-genesis-company-identity", "1.0.0");
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", locale === "en" ? "Establishment" : "Estabelecimento");
    if (context) {
        const scope = doc.createElement("small");
        scope.setAttribute("data-genesis-company-context", context.kind);
        const label = context.kind === "group"
            ? (locale === "en" ? "Business group" : "Grupo empresarial")
            : (locale === "en" ? "Company" : "Empresa");
        scope.textContent = label + " · " + companyIdentityName(context.company);
        row.appendChild(scope);
    }
    const name = doc.createElement("b");
    name.textContent = item.legalName;
    const detail = doc.createElement("small");
    // Preserve the existing Company's numeric CNPJ formatting; never invent UF.
    const cnpj = item.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    detail.textContent = (locale === "en" ? "Establishment" : "Estabelecimento") +
        " · " + cnpj + " · " + (item.state || "—");
    row.append(name, detail);
    host.appendChild(row);
}
