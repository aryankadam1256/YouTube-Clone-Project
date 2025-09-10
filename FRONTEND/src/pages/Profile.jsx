import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; 
const Profile = () => {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchChannel() {
      try {
        const res = await fetch(`/api/v1/users/c/${username}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch channel");
        const data = await res.json();
        setChannel(data.data);
      } catch (err) {
        setError(err.message);
      }
    }
    if (username) fetchChannel();
  }, [username]);

  if (error) return <p>Error: {error}</p>;
  if (!channel) return <p>Loading channel...</p>;

  return (
    <main>
      <h1>{channel.fullName || channel.username}</h1>
      <img src={channel.avatar} alt="Avatar" width={120} />
      <p>Subscribers: {channel.subscribersCount}</p>
      <p>Email: {channel.email}</p>
      {/* Add more profile details here */}
    </main>
  );
};

export default Profile;
