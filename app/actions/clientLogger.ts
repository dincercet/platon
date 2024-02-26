"use server";
import logger from "winston-config";

export default async function clientLogger(message: string) {
  logger.log(message);
}
