import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { User } from "../types";
import { StudioGlowCard } from "./StudioGlowCard";
import { UserCard } from "./UserCard";

interface UserListProps {
  users: User[];
  selectedHobbies: string[];
  resetKey: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

const ROW_ESTIMATE = 130;

function visibleHobbyCount(
  user: User,
  expanded: boolean,
  selectedHobbies: string[],
): number {
  if (expanded) return user.hobbies.length;
  if (selectedHobbies.length > 0) {
    return selectedHobbies.filter((hobby) => user.hobbies.includes(hobby))
      .length;
  }
  return Math.min(2, user.hobbies.length);
}

function estimateRowHeight(
  user: User,
  expanded: boolean,
  selectedHobbies: string[],
  listWidth: number,
): number {
  const hobbyCount = visibleHobbyCount(user, expanded, selectedHobbies);
  const showMoreChip =
    !expanded &&
    (selectedHobbies.length > 0
      ? user.hobbies.some((hobby) => !selectedHobbies.includes(hobby))
      : user.hobbies.length > 2);
  const chipSlots = hobbyCount + (showMoreChip ? 1 : 0);
  // Narrow lists wrap chips much earlier than desktop.
  const chipsPerRow =
    listWidth > 0 && listWidth < 420 ? 2 : listWidth < 640 ? 3 : 5;
  const hobbyRows = Math.max(
    1,
    Math.ceil(Math.max(chipSlots, 1) / chipsPerRow),
  );
  return 84 + hobbyRows * 32 + 20;
}

export function UserList({
  users,
  selectedHobbies,
  resetKey,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: UserListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [listWidth, setListWidth] = useState(0);

  useLayoutEffect(() => {
    const root = parentRef.current;
    if (!root) return;

    const updateWidth = () => {
      setListWidth(root.clientWidth);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const user = users[index];
      if (!user) return ROW_ESTIMATE;
      return estimateRowHeight(
        user,
        user.id === expandedUserId,
        selectedHobbies,
        listWidth,
      );
    },
    overscan: 8,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastItem = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    parentRef.current?.scrollTo({ top: 0 });
    setExpandedUserId(null);
  }, [resetKey]);

  // Remeasure from DOM whenever layout-affecting inputs change.
  useLayoutEffect(() => {
    const sync = () => {
      const root = parentRef.current;
      if (!root) return;

      virtualizer.measure();

      for (const item of virtualizer.getVirtualItems()) {
        const el = root.querySelector<HTMLElement>(
          `[data-index="${item.index}"]`,
        );
        if (!el) continue;
        const height = el.offsetHeight;
        if (height > 0) {
          virtualizer.resizeItem(item.index, height);
        }
      }
    };

    sync();
    const frame = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frame);
  }, [expandedUserId, selectedHobbies, listWidth, users, virtualizer]);

  useEffect(() => {
    if (expandedUserId == null) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (target.closest("[data-expand-hobbies]")) return;
      if (target.closest(`[data-user-hobbies="${expandedUserId}"]`)) return;

      setExpandedUserId(null);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [expandedUserId]);

  useEffect(() => {
    if (!lastItem) return;
    if (
      lastItem.index >= users.length - 5 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      onLoadMore();
    }
  }, [lastItem, users.length, hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <StudioGlowCard className="h-full" contentClassName="h-full">
      <div
        ref={parentRef}
        className="relative z-0 h-full overflow-y-auto p-2"
      >
        <div
          className="relative w-full"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualItems.map((item) => {
            const user = users[item.index];
            const isExpanded = expandedUserId === user.id;
            return (
              <div
                key={user.id}
                data-index={item.index}
                ref={virtualizer.measureElement}
                className={[
                  "absolute top-0 left-0 w-full px-1 py-1",
                  isExpanded ? "z-10" : "z-0",
                  "hover:z-50 focus-within:z-50",
                ].join(" ")}
                style={{ transform: `translateY(${item.start}px)` }}
              >
                <UserCard
                  user={user}
                  selectedHobbies={selectedHobbies}
                  hobbiesExpanded={isExpanded}
                  onExpandHobbies={setExpandedUserId}
                />
              </div>
            );
          })}
        </div>
        {isFetchingNextPage && (
          <p className="py-3 text-center text-sm text-[var(--color-muted)]">
            Loading more…
          </p>
        )}
      </div>
    </StudioGlowCard>
  );
}
