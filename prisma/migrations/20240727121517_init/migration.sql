-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(150) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `did_register` BOOLEAN NOT NULL DEFAULT false,
    `role` ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `legacy` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_curriculums` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `legacy` BOOLEAN NOT NULL DEFAULT false,
    `course_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curriculum_weeks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `week_no` INTEGER NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `curriculum_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curriculum_periods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `begins_at` DATETIME(3) NOT NULL,
    `ends_at` DATETIME(3) NOT NULL,
    `curriculum_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `period_weeks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `week_no` INTEGER NOT NULL,
    `period_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `week_documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `file_name` VARCHAR(300) NOT NULL,
    `week_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users_periods` (
    `user_id` INTEGER NOT NULL,
    `period_id` INTEGER NOT NULL,

    PRIMARY KEY (`user_id`, `period_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course_curriculums` ADD CONSTRAINT `course_curriculums_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_weeks` ADD CONSTRAINT `curriculum_weeks_curriculum_id_fkey` FOREIGN KEY (`curriculum_id`) REFERENCES `course_curriculums`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_periods` ADD CONSTRAINT `curriculum_periods_curriculum_id_fkey` FOREIGN KEY (`curriculum_id`) REFERENCES `course_curriculums`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `period_weeks` ADD CONSTRAINT `period_weeks_period_id_fkey` FOREIGN KEY (`period_id`) REFERENCES `curriculum_periods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `week_documents` ADD CONSTRAINT `week_documents_week_id_fkey` FOREIGN KEY (`week_id`) REFERENCES `period_weeks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users_periods` ADD CONSTRAINT `users_periods_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users_periods` ADD CONSTRAINT `users_periods_period_id_fkey` FOREIGN KEY (`period_id`) REFERENCES `curriculum_periods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
