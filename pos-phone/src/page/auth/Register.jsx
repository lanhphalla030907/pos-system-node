import React, { useState } from "react";
import { request } from "../../util/helper";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [state, setState] = useState({
    role_id: 1,
    name: "",
    username: "",
    password: "",
    is_active: 1,
    create_by: "Admin",
  });

  const handleChange = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const param = {
      role_id: state.role_id,
      name: state.name,
      username: state.username,
      password: state.password,
      is_active: state.is_active,
      create_by: state.create_by,
    };

    const res = await request("auth/register", "post", param);

    if (!res.error) {
      alert("Register Successfully");
      navigate("/login");
    } else {
      alert(res.message || res.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Register</h2>

        <form onSubmit={handleRegister} className="space-y-5">

          <div>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={state.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={state.username}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label>Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={state.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Enter password"
              />

              <button
                type="button"
                className="absolute right-3 top-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
          >
            Register
          </button>

        </form>
      </div>
    </div>
  );
};

export default Register;