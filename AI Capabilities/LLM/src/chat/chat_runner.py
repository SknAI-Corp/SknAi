def interactive_chat(qa_chain):
    print("Welcome to the Interactive Dermatologist Assistant!")
    print("Type 'exit' to quit.")

    while True:
        query = input("\nYour question: ")
        if query.lower() == 'exit':
            print("Goodbye!")
            break
        result = qa_chain({"query": query})
        print("AI Response:", result["result"])

        follow_up = input("\nDo you have any follow-up questions? (yes/no): ")
        if follow_up.lower() != 'yes':
            print("Thank you for using the assistant!")
            break
