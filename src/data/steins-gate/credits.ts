import { LuGlobe } from "react-icons/lu";
import { SiFacebook, SiGithub, SiInstagram } from "react-icons/si";

import type { CreditPerson } from "./types";

// TODO: replace the placeholder names and "#" links below with the real
// team credits before launch. Roles, partners, and volunteer list are drafts.
export const credits = {
  eyebrow: "credits_",
  heading: "ผู้จัดทำ",
  labMembers: {
    title: "สมาชิกแล็บ",
    members: [
      {
        name: "Phachara Chirapakachote",
        role: "แพตช์ / แปล / ตรวจทาน",
        socials: [
          { label: "เว็บไซต์", href: "https://phachara.net", icon: LuGlobe },
          { label: "GitHub", href: "https://github.com/ModzabazeR", icon: SiGithub },
        ],
      },
      {
        name: "Nattamon Polvichai (natTP)",
        role: "แปล / ตรวจทาน / กราฟิก",
        socials: [
          { label: "Facebook", href: "https://www.facebook.com/natTPpage", icon: SiFacebook },
          {
            label: "Instagram",
            href: "https://www.instagram.com/art.at.nattp",
            icon: SiInstagram,
          },
          { label: "เว็บไซต์", href: "https://blog.nattp.page", icon: LuGlobe },
        ],
      },
      {
        name: "Amaritto",
        role: "แปล / กราฟิก",
      },
      {
        name: "Ranviee",
        role: "โปรแกรมมิ่ง",
        socials: [{ label: "GitHub", href: "https://github.com/Ranviee0", icon: SiGithub }],
      },
      { name: "Kittipon Wonglekha", role: "แปล" },
      { name: "Suthichai Pattarasopark", role: "แปล" },
    ] satisfies ReadonlyArray<CreditPerson>,
  },
  partners: {
    title: "พันธมิตร",
    members: [
      {
        name: "มีมวิทยาศาสตร์",
        role: "ผู้สนับสนุน",
        socials: [
          {
            label: "Facebook",
            href: "https://www.facebook.com/memewithyasart",
            icon: SiFacebook,
          },
        ],
      },
      {
        name: "MisterTime",
        role: "โลโก้ภาษาไทย",
        socials: [
          { label: "Facebook", href: "https://www.facebook.com/MisterTimeTH", icon: SiFacebook },
          { label: "เว็บไซต์", href: "https://sites.google.com/view/mistertime", icon: LuGlobe },
        ],
      },
    ] satisfies ReadonlyArray<CreditPerson>,
  },
  specialThanks: {
    title: "Special Thanks",
    names: [
      "Committee of Zero",
      "เกมถูกบอกด้วย",
      "ไม่พร้อมไม่แจก",
      "Jibrill",
      "mr_tawan",
    ] as readonly string[],
  },
  volunteers: {
    title: "ขอขอบคุณอาสาสมัครร่วมแปล",
    names: [
      "RookieTranslator",
      "Nuengrito",
      "CplMiller",
      "SaifaSS",
      "Indy4translation",
      "rew150",
      "GunsOrigins",
      "nuerdaopp",
      "padtai",
      "bookman_9",
      "burstspirit7777",
      "Akibara",
      "Makoto0w0",
      "L0b5t3r",
      "nithikorn1236",
      "Niw_pyr",
      "kentavtuber1",
      "Namnaronf",
      "not6248minecarft",
      "markzxc2545",
      "HUNGRYRICE",
      "Chukite",
    ] as readonly string[],
  },
} as const;
