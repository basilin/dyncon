import Image from 'next/image'
import styles from './page.module.css'
import ConfigDisplay from '../components/ConfigDisplay';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Add configuration display */}
      <ConfigDisplay />
    </main>
  )
}
