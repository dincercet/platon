import { Modal } from "@mantine/core";

export default function ShowDocumentsModal({
  opened,
  close,
}: {
  opened: boolean;
  close: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={() => {
        close();
      }}
      title="Documents"
      centered
    ></Modal>
  );
}
