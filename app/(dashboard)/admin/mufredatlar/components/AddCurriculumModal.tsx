import { useEffect, useState } from "react";
import {
  Stack,
  Button,
  Modal,
  NativeSelect,
  Textarea,
  Group,
  Accordion,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import addCurriculum from "../actions/addCurriculum";
import addCurriculumWeek from "../actions/addCurriculumWeek";

type AddWeekFormValues = {
  weekNo: number;
  weekDescription: string;
};

//validate addWeekForm via zod
const addWeekSchema = z.object({
  weekDescription: z
    .string()
    .min(1, { message: "Hafta açıklaması zorunludur." })
    .max(500, { message: "Hafta açıklaması 500 karakterden uzun olamaz." }),
});

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

  //selected course id to pass into addCurriculum to create empty curriculum (keeps it as string to set the 'NativeSelect' component value)
  const [selectedCourseId, setSelectedCourseId] = useState("");

  //set to true after empty curriculum is created
  const [isCurriculumInitiated, setIsCurriculumInitiated] = useState(false);

  //after empty curriculum is created, the id is set
  const [initiatedCurriculumId, setInitiatedCurriculumId] = useState(0);

  //array of added week descriptions
  const [addedWeeks, setAddedWeeks] = useState<
    { weekNo: number; weekDescription: string }[]
  >([]);

  // //mantine form hook (try for course selection)
  const form = useForm();
  // const form = useForm<FormValues>({
  //   initialValues: {
  //     courses: [],
  //   },
  //   validate: zodResolver(schema),
  // });

  //mantine form hook (After course is selected, the form to add a week is displayed)
  const addWeekForm = useForm<AddWeekFormValues>({
    initialValues: { weekNo: 1, weekDescription: "" },
    validate: zodResolver(addWeekSchema),
  });

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
    try {
      //addCurriculum action call
      const res = await addCurriculum(parseInt(selectedCourseId));
      if (!res.success || !res.curriculumId) {
        //error returned from addCurriculum action
        console.error(res.error);
        return;
      }

      setInitiatedCurriculumId(res.curriculumId);
      setIsCurriculumInitiated(true);
    } catch (e) {
      console.error("unknown error addCurriculum", e);
      close();
    }
  }

  async function handleAddWeek(values: AddWeekFormValues) {
    try {
      //addCurriculumWeek action call
      const res = await addCurriculumWeek(
        initiatedCurriculumId,
        values.weekNo,
        values.weekDescription,
      );

      if (!res.success) {
        //error returned from addCurriculumWeek action
        console.error(res.error);
        return;
      }
    } catch (e) {
      console.error("unknown error addCurriculumWeek", e);
      return;
    }

    //add new week to addedWeeks array and re-render Accordion
    setAddedWeeks([
      ...addedWeeks,
      { weekNo: values.weekNo, weekDescription: values.weekDescription },
    ]);

    //increment weekNo
    addWeekForm.setFieldValue("weekNo", addWeekForm.values.weekNo + 1);
    //set empty weekDescription
    addWeekForm.setFieldValue("weekDescription", "");
  }

  const weeksList = addedWeeks.map((week) => {
    return (
      <Accordion.Item key={week.weekNo} value={week.weekNo.toString()}>
        <Accordion.Control>{week.weekNo}. Hafta</Accordion.Control>
        <Accordion.Panel>{week.weekDescription}</Accordion.Panel>
      </Accordion.Item>
    );
  });

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
              disabled={!courses.length || isCurriculumInitiated}
            >
              Dersi Seç
            </Button>
          </Group>
        </form>

        {weeksList.length > 0 && <Accordion>{weeksList}</Accordion>}

        {isCurriculumInitiated && (
          <form
            onSubmit={addWeekForm.onSubmit((values, e) => {
              e?.preventDefault();
              console.log("week values: ", values);
              //validate the form, form.errors will be set if validation fails
              addWeekForm.validate();
              //if valid, continue
              if (addWeekForm.isValid()) handleAddWeek(values);
            })}
          >
            <Textarea
              placeholder={
                addWeekForm.values.weekNo + ". Hafta Derslerinin Açıklaması"
              }
              label={addWeekForm.values.weekNo + ". Hafta"}
              rightSection={
                <Button type="submit">
                  <IconPlus size={14} />
                </Button>
              }
              autosize
              minRows={3}
              {...addWeekForm.getInputProps("weekDescription")}
            />
          </form>
        )}
      </Stack>
    </Modal>
  );
}
