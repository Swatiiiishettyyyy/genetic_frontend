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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-[24rem]">
            <h1 className="font-poppins text-[clamp(1.25rem,1rem+0.45vw,1.375rem)] font-medium leading-[1.125] tracking-[-0.02em] text-nucleotide-ink">
              {overview.title}
            </h1>
            <p className="mt-[clamp(0.375rem,1vw,0.625rem)] font-inter text-[clamp(0.875rem,0.78rem+0.34vw,1rem)] leading-[1.5] text-nucleotide-muted">
              {overview.description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="h-[clamp(2.5rem,3.4vw,2.875rem)] rounded-lg bg-nucleotide-purple px-[clamp(1rem,3vw,1.25rem)] font-inter text-[clamp(0.8125rem,0.76rem+0.26vw,0.9375rem)] font-semibold leading-5 text-white transition hover:bg-[#7447e8] sm:self-start"
          >
            {overview.actionLabel}
          </button>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
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
