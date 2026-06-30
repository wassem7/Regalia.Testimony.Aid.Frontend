"use client";

import type { Admin, AdminRole } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import Avatar from "./Avatar";
import { PlusIcon, ShieldIcon } from "./icons";

interface Props {
  admins: Admin[];
  onAdd: () => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

function roleClass(role: AdminRole): string {
  if (role === "Super Admin") return "role super";
  if (role === "Admin") return "role admin";
  return "role viewer";
}

export default function AdminsTable({ admins, onAdd, onToggle, onRemove }: Props) {
  return (
    <div className="maxw">
      <div className="phdr">
        <div>
          <div className="eyebrow">ACCESS CONTROL</div>
          <div className="pgtitle">Admins</div>
          <div className="psub">
            Manage who can review and publish testimonies.
          </div>
        </div>
        <button className="btn btn-accent" onClick={onAdd}>
          <PlusIcon />
          Add admin
        </button>
      </div>

      <div className="banner">
        <ShieldIcon size={17} />
        <span>
          You&rsquo;re signed in as <b className="accent-text">Super Admin</b> —
          you can manage roles and revoke access.
        </span>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Admin</th>
            <th>TKN</th>
            <th>Role</th>
            <th>Last login</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a.id}>
              <td data-label="Admin">
                <div className="fx ac gap10">
                  <Avatar
                    name={a.name}
                    imageUrl={a.imageUrl}
                    className="who-avatar"
                  />
                  <span className="admin-name">{a.name}</span>
                </div>
              </td>
              <td className="mono admin-tkn" data-label="TKN">
                {a.tkn}
              </td>
              <td data-label="Role">
                <span className={roleClass(a.role)}>{a.role}</span>
              </td>
              <td className="admin-last" data-label="Last login">
                {timeAgo(a.lastLoginAt)}
              </td>
              <td data-label="Active">
                <div
                  className={"switch" + (a.isActive ? " on" : "")}
                  onClick={() => onToggle(a.id)}
                >
                  <div className="knob" />
                </div>
              </td>
              <td className="admin-actions">
                <button className="btn btn-danger" onClick={() => onRemove(a.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="psub mt14">
        Removing an admin revokes their access immediately. Role controls who
        can publish to the feed.
      </div>
    </div>
  );
}
