def recommend_activities(user_id: str, db, limit: int = 10):
    query = """
        SELECT
            a.id,
            a.act_name,
            a.category,
            a.description,
            COUNT(ui.interest) AS match_score
        FROM activities a
        JOIN user_interests ui
          ON (
               LOWER(a.category) LIKE '%' || LOWER(ui.interest) || '%'
               OR LOWER(a.description) LIKE '%' || LOWER(ui.interest) || '%'
             )
        WHERE ui.user_id = %s
        GROUP BY a.id
        ORDER BY match_score DESC
        LIMIT %s;
    """

    return db.fetch_all(query, (user_id, limit))
