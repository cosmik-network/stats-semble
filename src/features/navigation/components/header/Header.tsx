import Logo from "@/assets/semble-logo.svg";
import Image from "next/image";
import styles from "@/features/stats/components/primitives/primitives.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <Image
          src={Logo.src}
          alt=""
          width={28}
          height={28}
          style={{ width: "auto", height: 28 }}
          unoptimized
        />
        <span className={styles.headerTitle}>semble analytics</span>
      </div>
      <span className={styles.headerSub}>latest stats</span>
    </header>
  );
}
