/* eslint-disable */
"use client";

import { supabase } from "../lib/supabaseClient";


const GoogleLoginButton = () => {
  async function testLogin() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      console.log("구글 로그인 오류 발생");
      return;
    }
  }

  return (
    <div>
      <button onClick={testLogin}>구글 로그인</button>
    </div>
  );
};

export default GoogleLoginButton;