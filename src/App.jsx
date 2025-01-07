import React, { useState } from "react";
import styled from "styled-components";

const App = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      title: "Primer mensaje",
      body: "Este es el contenido del primer mensaje",
    },
    {
      id: 2,
      title: "Segundo mensaje",
      body: "Este es el contenido del segundo mensaje",
    },
  ]);

  const [newMessage, setNewMessage] = useState({ title: "", body: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.title && newMessage.body) {
      setMessages([...messages, { ...newMessage, id: messages.length + 1 }]);
      setNewMessage({ title: "", body: "" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMessage({ ...newMessage, [name]: value });
  };

  return (
    <Container>
      <h1>Message Board App</h1>
      <MessageList>
        {messages.map((msg) => (
          <MessageCard key={msg.id}>
            <h3>{msg.title}</h3>
            <p>{msg.body}</p>
          </MessageCard>
        ))}
      </MessageList>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="title"
          value={newMessage.title}
          onChange={handleChange}
          placeholder="titulo del mensaje"
          required
        />
        <Textarea
          name="body"
          value={newMessage.body}
          onChange={handleChange}
          placeholder="Escribe aqui tu mensaje"
          required
        />
        <Button type="submit">Agregar mensaje</Button>
      </Form>
    </Container>
  );
};

export default App;

// Estilos con styled-components

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  min-height: 100vh;
  background-color: #282c34;
  color: white;
  font-family: "Arial", sans-serif;
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 600px;
`;

const MessageCard = styled.div`
  padding: 15px;
  border-radius: 8px;
  background-color: #3a3f47;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 600px;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
`;

const Textarea = styled.textarea`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
  resize: none;
`;

const Button = styled.button`
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: #61dafb;
  color: #282c34;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #21a1f1;
  }
`;
