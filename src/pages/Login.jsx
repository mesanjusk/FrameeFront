import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/planner");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-green-100">
      <h2 className="mb-4 text-2xl font-bold">Login to BT Planner</h2>
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow w-80 flex flex-col gap-4">
        <input placeholder="Email" className="p-2 border rounded" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" className="p-2 border rounded" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Login</button>
        <div className="text-center mt-2">
          <span>Don't have an account?</span>
          <button className="text-blue-700 ml-2" onClick={() => navigate("/register")}>Register</button>
        </div>
      </form>
    </div>
  );
}
