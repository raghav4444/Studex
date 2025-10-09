import { useState, useEffect } from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { User } from "../types";

// Utility function to format names consistently
const formatDisplayName = (name: string | undefined, email: string | undefined): string => {
  // If we have a proper name, use it
  if (name && name.trim() && name !== email?.split("@")[0]) {
    return name.trim();
  }
  
  // Fallback to email-based name formatting
  if (!email) return "User";
  
  const emailPrefix = email.split("@")[0];
  
  // Handle common email patterns
  if (emailPrefix.includes(".") || emailPrefix.includes("_")) {
    // Convert dots and underscores to spaces and capitalize
    return emailPrefix
      .replace(/[._]/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  
  // For simple email prefixes, just capitalize first letter
  return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).toLowerCase();
};

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    console.log("🔍 Auth hook initialized, loading state:", loading);

    // Add a timeout fallback to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn(
        "⚠️ Auth initialization timed out, setting loading to false"
      );
      setLoading(false);
    }, 20000); // 10 second timeout

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        clearTimeout(timeoutId);
        console.log("📋 Initial session check:", {
          session: !!session,
          error,
          userEmail: session?.user?.email,
        });
        setSession(session);
        if (session?.user) {
          console.log("👤 User found, fetching profile...");
          fetchUserProfile(session.user);
        } else {
          console.log("❌ No user session, setting loading to false");
          setLoading(false);
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error("💥 Error getting session:", error);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", { event, session: !!session });
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [loading]);

  const fetchUserProfile = async (authUser: SupabaseUser, retryCount = 0) => {
    console.log("🔍 Fetching profile for user:", authUser.id, authUser.email);

    // Query the database for the user's profile
    try {
      console.log("🔍 About to query profiles table for user:", authUser.id);

      // Add a timeout wrapper for the query
      const queryPromise = supabase
        .from("profiles")
        .select("*")
        .eq("user_id", authUser.id);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Query timeout")), 5000)
      );

      const { data: profiles, error } = (await Promise.race([
        queryPromise,
        timeoutPromise,
      ])) as {
        data:
          | {
              id: string;
              name: string;
              email: string;
              college: string;
              branch: string;
              year: number;
              bio?: string;
              avatar_url?: string;
              skills?: string[];
              achievements?: string[];
              is_verified: boolean;
              is_anonymous: boolean;
              created_at: string;
              updated_at: string;
            }[]
          | null;
        error: Error | null;
      };

      console.log("📊 Profile query completed!");
      console.log("📊 Query result:", {
        profileCount: profiles?.length || 0,
        error: error?.message,
        retryCount,
      });

      if (error) {
        console.error("💥 Profile query error:", error.message);
        
        // Retry logic for network errors
        if (retryCount < 2 && (error.message.includes("timeout") || error.message.includes("network"))) {
          console.log(`🔄 Retrying profile fetch (attempt ${retryCount + 1}/2)...`);
          setTimeout(() => fetchUserProfile(authUser, retryCount + 1), 1000);
          return;
        }
        
        setLoading(false);
        return;
      }

      if (profiles && profiles.length > 0) {
        const profile = profiles[0]; // Get the first profile
        console.log("✅ Profile found:", {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          college: profile.college,
        });

        const user: User = {
          id: profile.id,
          name: formatDisplayName(profile.name, profile.email),
          username: profile.username || formatDisplayName(profile.name, profile.email).toLowerCase().replace(/\s+/g, ''),
          email: profile.email,
          college: profile.college,
          branch: profile.branch,
          year: profile.year,
          bio: profile.bio || "",
          avatar: profile.avatar_url,
          skills: profile.skills || [],
          achievements: profile.achievements || [],
          isVerified: profile.is_verified,
          isAnonymous: profile.is_anonymous,
          joinedAt: new Date(profile.created_at),
          lastActive: new Date(profile.updated_at),
        };
        setUser(user);
        console.log("👤 User set successfully:", user.name);
        setLoading(false);
        return;
      } else {
        console.log("⚠️ No profile found in database, creating fallback profile");
      }
    } catch (error) {
      console.error("💥 Error querying profile:", error instanceof Error ? error.message : "Unknown error");

      // Retry logic for general errors
      if (retryCount < 2) {
        console.log(`🔄 Retrying profile fetch due to error (attempt ${retryCount + 1}/2)...`);
        setTimeout(() => fetchUserProfile(authUser, retryCount + 1), 1000);
        return;
      }
    }

    // FALLBACK: Create a basic user profile from auth data
    console.log("🔄 Creating fallback user profile from auth data");
    
    const fallbackUser: User = {
      id: "fallback-" + authUser.id,
      name: formatDisplayName(undefined, authUser.email),
      username: formatDisplayName(undefined, authUser.email).toLowerCase().replace(/\s+/g, ''),
      email: authUser.email || "",
      college: "Axis Colleges",
      branch: "Computer Science",
      year: 2023,
      bio: "Profile loaded from authentication data",
      avatar: undefined,
      skills: [],
      achievements: [],
      isVerified: true,
      isAnonymous: false,
      joinedAt: new Date(),
      lastActive: new Date(),
    };

    setUser(fallbackUser);
    console.log("✅ Fallback user profile created:", fallbackUser.name);
    setLoading(false);
  };

  const signUp = async (userData: {
    name: string;
    email: string;
    password: string;
    college: string;
    branch: string;
    year: number;
    bio?: string;
  }) => {
    setLoading(true);
    try {
      // Validate college email with expanded patterns
      const collegeEmailPatterns = [
        /\.edu$/i,
        /\.ac\.in$/i,
        /@.*college.*\.in$/i,
        /@.*university.*\.in$/i,
        /@.*institute.*\.in$/i,
        /@axiscolleges\.in$/i,
      ];

      const isValidCollegeEmail = collegeEmailPatterns.some((pattern) =>
        pattern.test(userData.email)
      );

      if (!isValidCollegeEmail) {
        throw new Error(
          "Please use your college email (.edu or .ac.in domain)"
        );
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Generate username from name
        const baseUsername = userData.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
        const username = baseUsername.length >= 3 ? baseUsername : baseUsername + '123';
        
        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: data.user.id,
          name: userData.name,
          username: username,
          email: userData.email,
          college: userData.college,
          branch: userData.branch,
          year: userData.year,
          bio: userData.bio || "",
          is_verified: isValidCollegeEmail,
        });

        if (profileError) throw profileError;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to create account");
      }
      throw new Error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to sign in");
      }
      throw new Error("Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      await supabase.from("profiles").update({
        name: updates.name,
        bio: updates.bio,
        skills: updates.skills,
        is_anonymous: updates.isAnonymous,
        updated_at: new Date().toISOString(),
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to update profile");
      }
      throw new Error("Failed to update profile");
    }

    // Update local state
    setUser({ ...user, ...updates });
  };

  const createMissingProfile = async () => {
    if (!session?.user) {
      console.error("❌ No authenticated user to create profile for");
      return false;
    }

    setLoading(true);
    try {
      console.log("🔨 Manually creating profile for user:", session.user.email);

      const displayName = formatDisplayName(undefined, session.user.email);
      const username = displayName.toLowerCase().replace(/\s+/g, '');
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .insert({
          user_id: session.user.id,
          name: displayName,
          username: username,
          email: session.user.email,
          college: "Axis Colleges",
          branch: "Computer Science",
          year: 2023,
          bio: "",
          is_verified: true,
          is_anonymous: false,
        })
        .select()
        .single();

      if (error) {
        console.error("💥 Failed to create profile:", error);
        return false;
      }

      if (profile) {
        console.log("✅ Profile created manually:", profile);
        await fetchUserProfile(session.user);
        return true;
      }
    } catch (error) {
      console.error("💥 Error in createMissingProfile:", error);
      return false;
    } finally {
      setLoading(false);
    }

    return false;
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn, // Ensure this is exported for external usage
    signOut, // Ensure this is exported for external usage
    updateProfile,
    createMissingProfile, // Add this new function
  };
};
