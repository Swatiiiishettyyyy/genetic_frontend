import { useState } from "react";
import { EditProfileModal } from "./EditProfileModal.jsx";
import { FamilyProfileCard } from "./FamilyProfileCard.jsx";

export function FamilyProfilesSection({ members: initialMembers, overview }) {
  const [members, setMembers] = useState(initialMembers);
  const [addOpen, setAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  function handleAdd(draft) {
    const initials = draft.name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
    setMembers((prev) => [
      ...prev,
      {
        id: `member-${Date.now()}`,
        initials,
        name: draft.name,
        relation: draft.relationship,
        status: "Active Profile",
        age: "",
        currentlyViewing: false,
      },
    ]);
  }

  function handleEdit(draft) {
    const initials = draft.name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
    setMembers((prev) =>
      prev.map((m) =>
        m.id === editingMember.id
          ? { ...m, initials, name: draft.name, relation: draft.relationship, gender: draft.gender, birthdate: draft.birthdate }
          : m
      )
    );
  }

  return (
    <>
      <section className="min-w-0 space-y-[clamp(0.875rem,2vw,1.25rem)]" aria-label={overview.title}>
        <div className="flex items-start justify-between gap-3 sm:items-start">
          <div className="min-w-0 max-w-[24rem]">
            <h1 className="font-poppins text-[1.125rem] font-semibold leading-[1.2] text-nucleotide-ink sm:text-[clamp(1.25rem,1rem+0.45vw,1.375rem)] sm:font-medium">
              {overview.title}
            </h1>
            <p className="mt-0.5 max-w-[16rem] font-inter text-[0.75rem] leading-[1.4] text-nucleotide-muted sm:mt-[clamp(0.375rem,1vw,0.625rem)] sm:max-w-none sm:text-[clamp(0.875rem,0.78rem+0.34vw,1rem)] sm:leading-[1.5]">
              {overview.description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="h-10 shrink-0 rounded-full bg-nucleotide-purple px-4 font-inter text-[0.8125rem] font-semibold leading-5 text-white shadow-[0_0.75rem_1.5rem_rgba(139,92,246,0.22)] transition hover:bg-[#7447e8] focus:outline-none focus:ring-4 focus:ring-nucleotide-purple/15 sm:h-[clamp(2.5rem,3.4vw,2.875rem)] sm:rounded-lg sm:px-[clamp(1rem,3vw,1.25rem)] sm:text-[clamp(0.8125rem,0.76rem+0.26vw,0.9375rem)] sm:shadow-none sm:self-start"
          >
            {overview.actionLabel}
          </button>
        </div>

        <div className="grid max-w-[68rem] gap-3 sm:gap-4 xl:grid-cols-2">
          {members.map((member) => (
            <FamilyProfileCard
              key={member.id}
              member={member}
              onEdit={() => setEditingMember(member)}
            />
          ))}
        </div>
      </section>

      {addOpen && (
        <EditProfileModal
          mode="add"
          profile={null}
          onClose={() => setAddOpen(false)}
          onSave={handleAdd}
        />
      )}

      {editingMember && (
        <EditProfileModal
          mode="edit"
          lockRelationship={editingMember.relation === "Self"}
          profile={{
            initials: editingMember.initials,
            name: editingMember.name,
            relation: editingMember.relation,
            email: editingMember.email ?? "",
            phone: editingMember.phone ?? "",
            gender: editingMember.gender ?? "Male",
            birthdate: editingMember.birthdate ?? "",
          }}
          onClose={() => setEditingMember(null)}
          onSave={handleEdit}
        />
      )}
    </>
  );
}
