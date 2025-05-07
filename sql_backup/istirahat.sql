-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 07 Apr 2025 pada 05.12
-- Versi server: 10.4.27-MariaDB
-- Versi PHP: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ganntchart`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `istirahat`

-- Dumping data untuk tabel `istirahat`
--

INSERT INTO `istirahat` (`id`, `shift_id`, `nama_istirahat`, `jam_mulai`, `jam_selesai`) VALUES
(1, 1, 'Break 1 Wakom', '02:00:00', '02:10:00'),
(2, 1, 'Break 2 Makan', '04:20:00', '04:50:00'),
(3, 1, 'Break 3 Sholat', '04:50:00', '05:00:00'),
(4, 2, 'Break 1 Wakom', '09:30:00', '09:40:00'),
(5, 2, 'Break 2 Ishoma', '11:45:00', '12:25:00'),
(6, 2, 'Break 3 Wakom', '15:10:00', '15:20:00'),
(7, 3, 'Break 1 Ishoma', '17:50:00', '18:10:00'),
(8, 3, 'Break 2 Wakom + Sholat', '19:10:00', '19:50:00'),
(9, 3, 'Break 3 Wakom', '22:00:00', '22:10:00');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `istirahat`
--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `istirahat`
--
ALTER TABLE `istirahat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `istirahat`
--
ALTER TABLE `istirahat`
  ADD CONSTRAINT `istirahat_ibfk_1` FOREIGN KEY (`shift_id`) REFERENCES `shift` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
