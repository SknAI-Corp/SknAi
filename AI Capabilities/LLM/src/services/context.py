def get_conversation_history(session_id, store):
    history = store.get(session_id, [])
    return "\n\n".join(f"User: {msg['query']}\nAI: {msg['response']}" for msg in history)
