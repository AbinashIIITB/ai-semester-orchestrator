import math
from datetime import timedelta, datetime
from typing import List, Dict, Any

from .state import AgentState

def _generate_weeks(start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
    """Generate a list of weeks between start and end dates."""
    weeks = []
    current_date = start_date
    week_num = 1
    
    while current_date <= end_date:
        week_end = current_date + timedelta(days=4) # Assuming Mon-Fri work week for academic schedule
        if week_end > end_date:
            week_end = end_date
            
        weeks.append({
            "week": week_num,
            "start_date": current_date.strftime("%Y-%m-%d"),
            "end_date": week_end.strftime("%Y-%m-%d"),
            "topics": [],
            "is_holiday": False,
            "is_midterm": False
        })
        
        current_date += timedelta(days=7) # Move to next week
        week_num += 1
        
    return weeks

def _is_holiday_week(week_start: datetime, week_end: datetime, holidays: List[datetime]) -> bool:
    """Check if a significant portion of the week is a holiday."""
    # Simplified logic: if any holiday falls in this week, flag it.
    for h in holidays:
        if week_start <= h <= week_end:
            return True
    return False

async def scheduler_node(state: AgentState) -> AgentState:
    """
    Deterministically calculates the schedule.
    Expects state to have 'extracted_calendar' and 'extracted_topics' (or fetches them from DB in a real implementation).
    """
    
    # In a fully integrated system, this node would query the database using state['course_id']
    # For this graph step, we assume the data is passed in state or we mock it if missing for testing.
    
    calendar = state.get("extracted_calendar")
    topics = state.get("extracted_topics")
    
    if not calendar or not topics:
        return {**state, "error": "Missing calendar or topics data for scheduling"}
        
    try:
        start_date = datetime.strptime(calendar["start_date"], "%Y-%m-%d")
        end_date = datetime.strptime(calendar["end_date"], "%Y-%m-%d")
        midterm_week = calendar.get("midterm_week")
        
        holidays_dates = [
            datetime.strptime(h["date"], "%Y-%m-%d") for h in calendar.get("holidays", [])
        ]
        
        # 1. Generate all calendar weeks
        all_weeks = _generate_weeks(start_date, end_date)
        
        # 2. Mark holidays and midterms
        teaching_weeks = []
        for w in all_weeks:
            w_start = datetime.strptime(w["start_date"], "%Y-%m-%d")
            w_end = datetime.strptime(w["end_date"], "%Y-%m-%d")
            
            if _is_holiday_week(w_start, w_end, holidays_dates):
                w["is_holiday"] = True
            elif midterm_week and w["week"] == midterm_week:
                w["is_midterm"] = True
            else:
                teaching_weeks.append(w)
                
        # 3. Distribute topics evenly across teaching weeks
        num_teaching_weeks = len(teaching_weeks)
        if num_teaching_weeks == 0:
             return {**state, "error": "No available teaching weeks found"}
             
        # Sort topics by order just in case
        sorted_topics = sorted(topics, key=lambda x: x.get("topic_order", 0))
        
        topics_per_week = math.ceil(len(sorted_topics) / num_teaching_weeks)
        
        topic_idx = 0
        for w in teaching_weeks:
            assigned = 0
            while assigned < topics_per_week and topic_idx < len(sorted_topics):
                w["topics"].append(sorted_topics[topic_idx]["topic_name"])
                topic_idx += 1
                assigned += 1
                
        return {
            **state,
            "roadmap": all_weeks,
            "error": None
        }
        
    except Exception as e:
        return {**state, "error": f"Scheduling failed: {str(e)}"}
