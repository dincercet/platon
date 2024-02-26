"use server";
import logger from "winston-config";

export default function clientLogger(message: string) {
  logger.log(message);
}
