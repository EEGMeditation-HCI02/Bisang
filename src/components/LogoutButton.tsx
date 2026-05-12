import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error);
      return;
    }

    navigate("/");
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}