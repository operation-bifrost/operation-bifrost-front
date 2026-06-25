import { LuQrCode, LuWallet } from "react-icons/lu";
import { SiBitcoin, SiEthereum, SiKofi, SiSolana } from "react-icons/si";

import type { DonateChannel } from "./types";

export const donate = {
  eyebrow: "donate_",
  heading: "สนับสนุนโปรเจกต์",
  description:
    "Operation Bifrost เป็นโปรเจกต์แฟนแปลที่ไม่แสวงหากำไร ทุกการสนับสนุนช่วยเป็นค่าเซิร์ฟเวอร์ ค่าฟอนต์ และเครื่องมือที่ใช้ในการแปล",
  // Label for the right-hand selector rail.
  channelsLabel: "channels",
  // Support console channels. A "view" channel renders its content (the QR
  // slip) in the console's left panel when its tab is selected; a "link"
  // channel opens an external URL instead. PromptPay is the primary in-place
  // channel; Ko-fi navigates out.
  // TODO: replace the placeholder "#" link with the real donation URL.
  channels: [
    {
      kind: "view",
      id: "promptpay",
      name: "PromptPay",
      caption: "สแกน QR · บัญชีธนาคาร",
      icon: LuQrCode,
      fallbackLabel: "หากสแกนไม่ได้ สามารถโอนเข้าบัญชีได้เลยเช่นกันครับ",
      account: {
        holder: "นาย พชร จิระภคโชติ",
        bank: "กสิกรไทย",
        number: "148-1-35847-3",
      },
      qrSrc: "/images/qr-promptpay.webp",
    },
    {
      kind: "crypto",
      id: "crypto",
      name: "Crypto",
      caption: "คริปโตเคอเรนซี",
      icon: LuWallet,
      networks: [
        {
          label: "Ethereum / EVM",
          address: "0xcC2Fe145792c034708294E19E466f1664c58BC1f",
          assets: "ETH และ ERC-20 บนเครือข่าย EVM (Ethereum, Base, Arbitrum ฯลฯ)",
          icon: SiEthereum,
        },
        {
          label: "Solana",
          address: "Die5bNQBHG5YA2SbDEYJpaBL9dTUSCNG8ohhMS1rbF7H",
          assets: "SOL และ SPL tokens บนเครือข่าย Solana เท่านั้น",
          icon: SiSolana,
        },
        {
          label: "Bitcoin",
          address: "bc1qzh2fsca2l0w2kq4eh8sey63p6t24ejv96l4c0d",
          assets: "BTC บนเครือข่าย Bitcoin (on-chain) เท่านั้น",
          icon: SiBitcoin,
        },
      ],
    },
    {
      kind: "link",
      name: "Ko-fi",
      caption: "เลี้ยงดร. เปปเปอร์",
      icon: SiKofi,
      href: "https://ko-fi.com/operationbifrost",
    },
  ] satisfies ReadonlyArray<DonateChannel>,
} as const;
