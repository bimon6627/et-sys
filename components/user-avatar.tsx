import RoundedImage from "./rounded-image";
import GetUserInfo from "./js/get-user-info";
export default async function UserAvatar() {
  const user = await GetUserInfo();
  const avatarSrc = user?.image ?? "../assets/default-profile.png";

  return (
    <RoundedImage src={avatarSrc} alt="User avatar" height={100} width={100} />
  );
}
