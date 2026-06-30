"use client";

import { useState } from "react";
import AddAdminModal from "@/components/AddAdminModal";
import AdminsTable from "@/components/AdminsTable";
import Toast from "@/components/Toast";
import { useAdmins } from "@/hooks/useAdmins";
import { useToast } from "@/hooks/useToast";

export default function AdminsPage() {
  const [addingAdmin, setAddingAdmin] = useState(false);
  const { message, show } = useToast();
  const admins = useAdmins();

  return (
    <>
      <AdminsTable
        admins={admins.admins}
        onAdd={() => setAddingAdmin(true)}
        onToggle={admins.toggle}
        onRemove={(id) => {
          void admins.remove(id);
          show("Admin access revoked");
        }}
      />

      {addingAdmin && (
        <AddAdminModal
          onClose={() => setAddingAdmin(false)}
          onAdd={async (tkn, role) => {
            await admins.add(tkn, role);
            show("Admin added");
          }}
        />
      )}

      {message && <Toast message={message} />}
    </>
  );
}
