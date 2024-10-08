"use client";

import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useEffect, useState } from "react";

import toast from "react-hot-toast";
import useAuthModal from "@/hooks/useAuthModal";
import { useRouter } from "next/navigation";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useUser } from "@/hooks/useUser";

interface LikeButtonProps {
  songId: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ songId }) => {
  const [isLiked, setIsLiked] = useState(false);

  const router = useRouter();
  const { supabaseClient } = useSessionContext();

  const authModal = useAuthModal();
  const { user } = useUser();

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      const { data, error } = await supabaseClient
        .from("liked_songs")
        .select("*")
        .eq("user_id", user.id)
        .eq("song_id", songId)
        .single();

      if (!error && data) setIsLiked(true);
    };

    fetchData();
  }, [user?.id, songId, supabaseClient]);

  const handleLike = async () => {
    if (!user) return authModal.onOpen();

    const { error } = isLiked
      ? await supabaseClient
          .from("liked_songs")
          .delete()
          .eq("user_id", user.id)
          .eq("song_id", songId)
      : await supabaseClient.from("liked_songs").insert({
          song_id: songId,
          user_id: user.id,
        });

    if (error) toast.error(error.message);
    else {
      setIsLiked(!isLiked);
      !isLiked && toast.success("Added to Favorite tracks");
    }

    router.refresh()
  };

  const Icon = isLiked ? AiFillHeart : AiOutlineHeart;

  return (
    <button className="hover:opacity-75 transition" onClick={handleLike}>
      <Icon color={isLiked ? "#22c55e" : "white"} size={25} />
    </button>
  );
};

export default LikeButton;
