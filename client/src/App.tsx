import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { EventDetail } from "./components/EventDetail";
import { EventList } from "./components/EventList";
import { IconBell, IconChat } from "./components/icons";
import { PlanTabs, type PlanTab } from "./components/PlanTabs";
import { Sidebar } from "./components/Sidebar";
import { UserPicker } from "./components/UserPicker";
import type { Event, User } from "./types";

const TAB_TITLES: Record<PlanTab, string> = {
  all: "discover",
  joined: "joined plans",
  created: "created plans",
  curated: "curated plans",
  saved: "saved plans",
  past: "past plans",
};

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PlanTab>("past");

  useEffect(() => {
    api.getUsers().then((u) => {
      setUsers(u);
      setCurrentUserId(u[0]?.id ?? "");
    });
    api.getEvents().then(setEvents);
  }, []);

  const currentUser = users.find((u) => u.id === currentUserId);

  const visibleEvents = useMemo(() => {
    const isPast = (e: Event) => new Date(e.endTime).getTime() < Date.now();
    switch (activeTab) {
      case "past":
        return events.filter(isPast);
      case "joined":
        return events.filter(
          (e) => e.goingUserIds.includes(currentUserId) || e.interestedUserIds.includes(currentUserId),
        );
      case "created":
        return events.filter((e) => e.creatorId === currentUserId);
      case "curated":
      case "saved":
        return [];
      case "all":
      default:
        return events;
    }
  }, [events, activeTab, currentUserId]);

  return (
    <div className="app-shell">
      {users.length > 0 && (
        <Sidebar users={users} currentUserId={currentUserId} onChangeUser={setCurrentUserId} />
      )}

      <div className="app-body">
        <header className="app-header">
          <div className="brand">pie</div>
          <div className="app-header-actions">
            <span className="feature-pill">memories concept</span>
            <button className="icon-btn" aria-label="Notifications">
              <IconBell />
            </button>
            <button className="icon-btn" aria-label="Messages">
              <IconChat />
            </button>
            {users.length > 0 && (
              <UserPicker
                users={users}
                currentUserId={currentUserId}
                onChangeUser={setCurrentUserId}
                className="user-picker-wrap--header"
              />
            )}
          </div>
        </header>

        <main className="app-main">
          {selectedEventId && currentUser ? (
            <EventDetail
              eventId={selectedEventId}
              currentUser={currentUser}
              users={users}
              onBack={() => setSelectedEventId(null)}
            />
          ) : (
            <>
              <p className="intro">
                A concept build modeling Pie's core RSVP flow, plus a new <strong>Memories</strong> feature: once a
                plan is <em>past</em>, anyone who RSVP'd can post photos and videos that live on as an
                Instagram-style highlight reel — tap to watch, 10 seconds per post, auto-advancing — visible to
                everyone who RSVP'd, whether or not they made it in person. Hosts control whether it's on and how
                long it lasts: 24 hours, 2 days, 3 days, or a week.
              </p>
              <PlanTabs active={activeTab} onChange={setActiveTab} />
              <h1 className="page-title">{TAB_TITLES[activeTab]}</h1>
              {visibleEvents.length === 0 ? (
                <p className="empty-state">No plans here yet.</p>
              ) : (
                <EventList events={visibleEvents} users={users} onSelect={setSelectedEventId} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
