import { useState } from "react";
import type { User } from "../types";

export function UserPicker({
  users,
  currentUserId,
  onChangeUser,
  className = "",
}: {
  users: User[];
  currentUserId: string;
  onChangeUser: (userId: string) => void;
  className?: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const currentUser = users.find((u) => u.id === currentUserId);

  if (!currentUser) return null;

  return (
    <div className={"user-picker-wrap " + className}>
      <button
        className="sidebar-avatar"
        onClick={() => setPickerOpen((o) => !o)}
        title={`Viewing as ${currentUser.name}`}
      >
        <img src={currentUser.avatarUrl} alt={currentUser.name} />
      </button>
      {pickerOpen && (
        <div className="user-picker">
          <span className="user-picker-label">Viewing as</span>
          {users.map((u) => (
            <button
              key={u.id}
              className={"user-picker-row" + (u.id === currentUserId ? " active" : "")}
              onClick={() => {
                onChangeUser(u.id);
                setPickerOpen(false);
              }}
            >
              <img src={u.avatarUrl} alt="" />
              <span>{u.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
