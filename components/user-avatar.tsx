import RoundedImage from "./rounded-image";
import GetUserAvatarSrc from "./js/get-user-avatar-src";
export default async function UserAvatar() {
  const avatarSrc = await GetUserAvatarSrc();
  console.log(avatarSrc);

  return <RoundedImage src={avatarSrc} alt="User avatar" height={35} width={35} />;
}
