"""
Analytics Service — Event tracking and business analytics.
"""
from datetime import datetime, timedelta


class AnalyticsService:
    """Process and aggregate event data for dashboards."""

    def __init__(self, supabase_client):
        self.supabase = supabase_client

    def track_event(self, event_data: dict) -> dict:
        """
        Track a user behavior event.
        Event types: view, click, purchase, bundle_click, search, voice_search, mood_select, share
        """
        event = {
            "user_id": event_data.get("user_id"),
            "catalog_id": event_data.get("catalog_id"),
            "event_type": event_data.get("event_type", "view"),
            "metadata": event_data.get("metadata", {}),
            "session_id": event_data.get("session_id", ""),
        }

        try:
            result = self.supabase.table("events").insert(event).execute()
            return {"success": True, "event_id": result.data[0]["id"] if result.data else None}
        except Exception as e:
            print(f"❌ Event tracking error: {e}")
            return {"success": False, "error": str(e)}

    def get_social_proof(self, catalog_ids: list = None) -> list:
        """
        Get social proof data — view and click counts in the last hour.
        Returns [{catalog_id, view_count, click_count}, ...]
        """
        try:
            one_hour_ago = (datetime.utcnow() - timedelta(hours=1)).isoformat()

            query = (
                self.supabase.table("events")
                .select("catalog_id, event_type")
                .gte("created_at", one_hour_ago)
                .in_("event_type", ["view", "click"])
            )

            if catalog_ids:
                query = query.in_("catalog_id", catalog_ids)

            result = query.execute()

            # Aggregate counts
            counts = {}
            for event in result.data:
                cid = event["catalog_id"]
                if cid not in counts:
                    counts[cid] = {"catalog_id": cid, "view_count": 0, "click_count": 0}
                if event["event_type"] == "view":
                    counts[cid]["view_count"] += 1
                elif event["event_type"] == "click":
                    counts[cid]["click_count"] += 1

            return list(counts.values())

        except Exception as e:
            print(f"❌ Social proof error: {e}")
            return []

    def get_analytics(self, owner_id: str = None, days: int = 7) -> dict:
        """
        Get comprehensive analytics for the business dashboard.
        """
        try:
            since = (datetime.utcnow() - timedelta(days=days)).isoformat()

            # Get all events in the period
            query = (
                self.supabase.table("events")
                .select("*")
                .gte("created_at", since)
                .order("created_at", desc=True)
            )
            result = query.execute()
            events = result.data

            # Aggregate by event type
            type_counts = {}
            daily_counts = {}
            top_items = {}
            hourly_activity = {}

            for event in events:
                # By type
                etype = event["event_type"]
                type_counts[etype] = type_counts.get(etype, 0) + 1

                # By day
                day = event["created_at"][:10]  # YYYY-MM-DD
                if day not in daily_counts:
                    daily_counts[day] = {"date": day, "views": 0, "clicks": 0, "purchases": 0}
                if etype == "view":
                    daily_counts[day]["views"] += 1
                elif etype == "click":
                    daily_counts[day]["clicks"] += 1
                elif etype == "purchase":
                    daily_counts[day]["purchases"] += 1

                # Top items
                cid = event.get("catalog_id")
                if cid:
                    if cid not in top_items:
                        top_items[cid] = {"catalog_id": cid, "views": 0, "clicks": 0, "purchases": 0}
                    if etype == "view":
                        top_items[cid]["views"] += 1
                    elif etype == "click":
                        top_items[cid]["clicks"] += 1
                    elif etype == "purchase":
                        top_items[cid]["purchases"] += 1

                # Hourly activity
                hour = event["created_at"][11:13]  # HH
                hourly_activity[hour] = hourly_activity.get(hour, 0) + 1

            # Sort top items by views
            sorted_top = sorted(top_items.values(), key=lambda x: x["views"], reverse=True)[:10]

            # Enrich top items with names from catalog
            if sorted_top:
                catalog_ids = [item["catalog_id"] for item in sorted_top]
                try:
                    catalog_result = (
                        self.supabase.table("catalog")
                        .select("id, name, category, image_url")
                        .in_("id", catalog_ids)
                        .execute()
                    )
                    catalog_map = {c["id"]: c for c in catalog_result.data}
                    for item in sorted_top:
                        info = catalog_map.get(item["catalog_id"], {})
                        item["name"] = info.get("name", "Unknown")
                        item["category"] = info.get("category", "")
                        item["image_url"] = info.get("image_url", "")
                except Exception:
                    pass

            # Format daily timeline
            timeline = sorted(daily_counts.values(), key=lambda x: x["date"])

            # Format hourly activity
            hourly = [{"hour": f"{h}:00", "count": c} for h, c in sorted(hourly_activity.items())]

            return {
                "summary": {
                    "total_events": len(events),
                    "total_views": type_counts.get("view", 0),
                    "total_clicks": type_counts.get("click", 0),
                    "total_purchases": type_counts.get("purchase", 0),
                    "total_searches": type_counts.get("search", 0) + type_counts.get("voice_search", 0),
                    "total_bundle_clicks": type_counts.get("bundle_click", 0),
                    "conversion_rate": round(
                        type_counts.get("purchase", 0) / max(type_counts.get("click", 0), 1) * 100, 2
                    ),
                },
                "timeline": timeline,
                "top_items": sorted_top,
                "hourly_activity": hourly,
                "event_breakdown": type_counts,
                "period_days": days,
            }

        except Exception as e:
            print(f"❌ Analytics error: {e}")
            return {
                "summary": {
                    "total_events": 0,
                    "total_views": 0,
                    "total_clicks": 0,
                    "total_purchases": 0,
                    "total_searches": 0,
                    "total_bundle_clicks": 0,
                    "conversion_rate": 0,
                },
                "timeline": [],
                "top_items": [],
                "hourly_activity": [],
                "event_breakdown": {},
                "period_days": days,
            }
