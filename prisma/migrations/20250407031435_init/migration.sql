-- CreateTable
CREATE TABLE `soddiagram` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cycle` INTEGER NOT NULL,
    `processName` VARCHAR(300) NULL,
    `waktu` TIME(0) NULL,
    `durasi` TIME(0) NULL,
    `customerName` VARCHAR(300) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `diagramsod` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processName` VARCHAR(250) NULL,
    `kode` VARCHAR(250) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `istirahat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shift_id` INTEGER NOT NULL,
    `nama_istirahat` VARCHAR(30) NOT NULL,
    `jam_mulai` TIME(0) NOT NULL,
    `jam_selesai` TIME(0) NOT NULL,

    INDEX `shift_id`(`shift_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shift` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode_shift` VARCHAR(100) NOT NULL,
    `jam_mulai` TIME(0) NOT NULL,
    `jam_selesai` TIME(0) NOT NULL,

    UNIQUE INDEX `kode_shift`(`kode_shift`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NULL,
    `password` VARCHAR(100) NULL,
    `createAt` DATETIME(0) NULL,

    UNIQUE INDEX `username`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `istirahat` ADD CONSTRAINT `istirahat_ibfk_1` FOREIGN KEY (`shift_id`) REFERENCES `shift`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
