import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./userContextHelpers";
import type { UserType } from "./userContextHelpers";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) return;

    // 유저 정보 불러오는 함수
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loadUser = async (session: any) => {
      if (!session?.user) {
        setUser(null);
        return;
      }
      if (!supabase) return;

      // profiles 조회
      // eslint-disable-next-line prefer-const
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      // 없으면 자동 생성
      if (!data) {
        const { data: insertedData, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: session.user.id,
            email: session.user.email,
          })
          .select()
          .single();

        if (insertError) {
          console.error(insertError);
          return;
        }

        data = insertedData;
      }

      if (error) {
        console.error(error);
        return;
      }

      setUser(data);
      setLoading(false);
    };

    // 최초 세션 복구
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUser(session);
    });

    // 로그인 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
