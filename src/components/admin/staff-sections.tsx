import { ConfirmSubmit, PendingSubmit } from "@/components/form/confirm-submit";
import { approveStaff, rejectStaff, revokeStaff } from "@/lib/admin/actions";
import type { StaffMember } from "@/lib/admin/queries";
import { formatDateTime } from "@/lib/format";
import type { ShelterOption } from "@/lib/shelters/queries";
import { tr } from "@/lib/strings/tr";

const t = tr.admin;

const primaryButton =
  "rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-60";
const secondaryButton =
  "rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100 disabled:opacity-60";
const dangerButton =
  "rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-60";
const selectClass =
  "w-full min-w-0 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 sm:w-auto";

function Contact({ member }: { member: StaffMember }) {
  return (
    <dl className="mt-1 grid gap-x-4 gap-y-0.5 text-sm text-stone-700 sm:grid-cols-[auto_1fr]">
      <dt className="font-medium">{t.email}</dt>
      <dd className="break-all">
        <a href={`mailto:${member.email}`} className="underline underline-offset-4">
          {member.email}
        </a>
        {!member.emailConfirmed && (
          <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
            {t.pending.emailUnconfirmed}
          </span>
        )}
      </dd>
      {member.phone && (
        <>
          <dt className="font-medium">{t.phone}</dt>
          <dd>
            <a href={`tel:${member.phone}`} className="underline underline-offset-4">
              {member.phone}
            </a>
          </dd>
        </>
      )}
    </dl>
  );
}

function ShelterSelect({
  id,
  label,
  shelters,
  defaultValue,
}: {
  id: string;
  label: string;
  shelters: ShelterOption[];
  defaultValue: string | null;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-stone-700">
        {label}
      </label>
      <select
        id={id}
        name="shelterId"
        required
        defaultValue={defaultValue ?? ""}
        className={selectClass}
      >
        <option value="" disabled>
          {tr.auth.fields.chooseShelter}
        </option>
        {shelters.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PendingStaff({
  members,
  shelters,
}: {
  members: StaffMember[];
  shelters: ShelterOption[];
}) {
  return (
    <section aria-labelledby="pending-heading">
      <h2 id="pending-heading" className="text-xl font-semibold">
        {t.pending.heading(members.length)}
      </h2>
      {members.length === 0 ? (
        <p className="mt-2 text-stone-600">{t.pending.empty}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {members.map((m) => (
            <li
              key={m.userId}
              className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm"
            >
              <p className="font-semibold text-stone-900">{m.fullName}</p>
              <p className="text-xs text-stone-500">
                {t.pending.signedUp(formatDateTime(m.createdAt))}
              </p>
              <Contact member={m} />
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <form action={approveStaff} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="userId" value={m.userId} />
                  <ShelterSelect
                    id={`approve-shelter-${m.userId}`}
                    label={t.pending.assignShelter}
                    shelters={shelters}
                    defaultValue={m.shelterId}
                  />
                  <PendingSubmit className={primaryButton}>{t.pending.approve}</PendingSubmit>
                </form>
                <form action={rejectStaff}>
                  <input type="hidden" name="userId" value={m.userId} />
                  <ConfirmSubmit
                    className={dangerButton}
                    confirmText={t.pending.rejectConfirm(m.fullName)}
                  >
                    {t.pending.reject}
                  </ConfirmSubmit>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ApprovedStaff({
  members,
  shelters,
  currentUserId,
}: {
  members: StaffMember[];
  shelters: ShelterOption[];
  currentUserId: string;
}) {
  const shelterName = (id: string | null) => shelters.find((s) => s.value === id)?.label ?? "—";

  return (
    <section aria-labelledby="staff-heading">
      <h2 id="staff-heading" className="text-xl font-semibold">
        {t.staff.heading(members.length)}
      </h2>
      {members.length === 0 ? (
        <p className="mt-2 text-stone-600">{t.staff.empty}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {members.map((m) => {
            const isAdmin = m.role === "platform_admin";
            return (
              <li
                key={m.userId}
                className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <p className="font-semibold text-stone-900">
                  {m.fullName} {m.userId === currentUserId && t.staff.you}
                  {isAdmin && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                      {t.staff.adminBadge}
                    </span>
                  )}
                </p>
                <Contact member={m} />
                {isAdmin ? (
                  m.shelterId && (
                    <p className="mt-1 text-sm text-stone-700">
                      {t.staff.shelter}: {shelterName(m.shelterId)}
                    </p>
                  )
                ) : (
                  <div className="mt-3 flex flex-wrap items-end gap-3">
                    <form action={approveStaff} className="flex flex-wrap items-end gap-2">
                      <input type="hidden" name="userId" value={m.userId} />
                      <ShelterSelect
                        id={`staff-shelter-${m.userId}`}
                        label={t.staff.shelter}
                        shelters={shelters}
                        defaultValue={m.shelterId}
                      />
                      <PendingSubmit className={secondaryButton}>
                        {t.staff.saveShelter}
                      </PendingSubmit>
                    </form>
                    <form action={revokeStaff}>
                      <input type="hidden" name="userId" value={m.userId} />
                      <input type="hidden" name="shelterId" value={m.shelterId ?? ""} />
                      <ConfirmSubmit
                        className={dangerButton}
                        confirmText={t.staff.revokeConfirm(m.fullName)}
                      >
                        {t.staff.revoke}
                      </ConfirmSubmit>
                    </form>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
