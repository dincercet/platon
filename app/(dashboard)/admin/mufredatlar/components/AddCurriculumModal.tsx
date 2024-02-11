import { useEffect, useState } from "react";
import {
  Stack,
  Button,
  Modal,
  NativeSelect,
  TextInput,
  Textarea,
  Group,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import addCurriculum from "../actions/addCurriculum";

// type FormValues = {
//   courses: {}[];
// };

// //validate via zod
// const schema = z.object({
//   name: z
//     .string()
//     .min(1, { message: "Ders ismi zorunludur" })
//     .max(150, { message: "Ders ismi 150 karakterden uzun olamaz." }),
//   description: z
//     .string()
//     .min(1, { message: "Ders açıklaması zorunludur." })
//     .max(500, { message: "Ders açıklaması 500 karakterden uzun olamaz." }),
// });

export default function AddCurriculumModal({
  opened,
  close,
}: {
  opened: boolean;
  close: () => void;
}) {
  //array of courses fetched
  const [courses, setCourses] = useState<
    { id: number; name: string; legacy: boolean }[]
  >([]);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isCurriculumInitiated, setIsCurriculumInitiated] = useState(false);

  // //mantine form hook
  const form = useForm();
  // const form = useForm<FormValues>({
  //   initialValues: {
  //     courses: [],
  //   },
  //   validate: zodResolver(schema),
  // });

  // //mantine form hook
  const weekForm = useForm();
  // const form = useForm<FormValues>({
  //   initialValues: {
  //     courses: [],
  //   },
  //   validate: zodResolver(schema),
  // });

  useEffect(() => {
    fetchCourses();
  }, []);

  //call to getCourses api, then set courses state
  async function fetchCourses() {
    const res = await fetch("mufredatlar/api/getCourses", { method: "GET" });
    const resParsed = await res.json();
    if (resParsed.courses.length > 0) setCourses(resParsed.courses);
  }

  async function handleInitiateCurriculum() {
    let res;
    try {
      //addCurriculum action call
      res = await addCurriculum(parseInt(selectedCourseId));
      if (!res.success) {
        //error returned from addCurriculum action
        console.error(res.error);
      }
      setIsCurriculumInitiated(true);
    } catch (e) {
      console.error("unknown error addCurriculum", e);
      close();
    }
  }

  return (
    <Modal opened={opened} onClose={close} title="Müfredat Ekle" centered>
      <Stack>
        <form
          onSubmit={form.onSubmit((values, e) => {
            e?.preventDefault();
            console.log("select values: ", values);
            handleInitiateCurriculum();
            // //validate the form, form.errors will be set if validation fails
            // form.validate();
            // //if valid, continue
            // if (form.isValid()) handleAddCurriculum();
          })}
        >
          <Group>
            <NativeSelect
              label="Dersi Seçiniz"
              value={selectedCourseId}
              onChange={(event) =>
                setSelectedCourseId(event.currentTarget.value)
              }
              disabled={!courses.length || isCurriculumInitiated}
              data={courses.map((course) => {
                return {
                  label: course.name,
                  value: course.id.toString(),
                  disabled: course.legacy,
                };
              })}
            />
            <Button
              type="submit"
              disabled={
                !courses.length ||
                selectedCourseId === "" ||
                isCurriculumInitiated
              }
            >
              Dersi Seç
            </Button>
          </Group>
        </form>
        <form
          onSubmit={weekForm.onSubmit((values, e) => {
            e?.preventDefault();
            console.log("week values: ", values);
            // //validate the form, form.errors will be set if validation fails
            // form.validate();
            // //if valid, continue
            // if (form.isValid()) handleAddCurriculum();
          })}
        >
          <Textarea
            placeholder="1. Hafta Derslerinin Açıklaması"
            label="1. Hafta"
            rightSection={
              <Button type="submit">
                <IconPlus size={14} />
              </Button>
            }
            autosize
            minRows={3}
          />
        </form>
      </Stack>
    </Modal>
  );
}
