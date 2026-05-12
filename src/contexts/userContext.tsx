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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loadUser = async (session: any) => {
      try {
        // 로그아웃 상태
        if (!session?.user) {
          setUser(null);
          setLoading(false);
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

        if (error) {
          console.error(error);
          return;
        }

        // profiles row 없으면 생성
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

        setUser(data);

        // 신규 유저 판별
        const isNewUser =
          session.user.created_at === session.user.last_sign_in_at;

        if (isNewUser) {
          navigate("/usersetting");
        } else {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
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