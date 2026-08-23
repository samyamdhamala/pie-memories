import type { User } from "../types";
import { IconCalendar, IconHome, IconPeople, IconSearch } from "./icons";
import { UserPicker } from "./UserPicker";

export function Sidebar({
  users,
  currentUserId,
  onChangeUser,
}: {
  users: User[];
  currentUserId: string;
  onChangeUser: (userId: string) => void;
}) {
  return (
    <nav className="sidebar">
      <button className="sidebar-btn sidebar-btn--active" aria-label="Discover">
        <IconHome />
      </button>
      <button className="sidebar-btn" aria-label="Plans">
        <IconCalendar />
      </button>
      <button className="sidebar-btn" aria-label="People">
        <IconPeople />
      </button>
      <button className="sidebar-btn" aria-label="Search">
        <IconSearch />
      </button>

      <UserPicker
        users={users}
        currentUserId={currentUserId}
        onChangeUser={onChangeUser}
        className="user-picker-wrap--sidebar"
      />
    </nav>
  );
}
