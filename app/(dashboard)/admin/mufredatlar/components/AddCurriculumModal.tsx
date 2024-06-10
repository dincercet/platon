import { useEffect, useState } from "react";
import {
  Stack,
  Button,
  Modal,
  NativeSelect,
  Textarea,
  Group,
  Accordion,
  ActionIcon,
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
  fetchCurriculums,
}: {
  opened: boolean;
  close: () => void;
  fetchCurriculums: () => Promise<void>;
}) {
  //array of courses fetched
  const [courses, setCourses] = useState<
    {
      id: number;
      name: string;
      legacy: boolean;
      curriculums: { legacy: boolean }[];
    }[]
  >([]);

  //selected course id to pass into addCurriculum to create empty curriculum (keeps it as string to set the 'NativeSelect' component value)
  const [selectedCourseId, setSelectedCourseId] = useState(0);

  //set to true after empty curriculum is created
  const [isCurriculumInitiated, setIsCurriculumInitiated] = useState(false);

  //after empty curriculum is created, the id is set
  const [initiatedCurriculumId, setInitiatedCurriculumId] = useState(0);

  //array of added week descriptions
  const [addedWeeks, setAddedWeeks] = useState<
    { weekNo: number; weekDescription: string }[]
  >([]);

  //mantine form hook (After course is selected, the form to add a week is displayed)
  const addWeekForm = useForm<AddWeekFormValues>({
    initialValues: { weekNo: 1, weekDescription: "" },
    validate: zodResolver(addWeekSchema),
  });

  useEffect(() => {
    fetchCourses();
    console.log("useEffect fetchCourses called");
  }, []);

  //call to getCourses api, then set courses state
  async function fetchCourses() {
    try {
      const res = await fetch("mufredatlar/api/getCourses", { method: "GET" });
      const resParsed = await res.json();

      if (!res.ok) {
        //error returned from api
        console.error(resParsed.error);
        return;
      }

      //set courses state based on retrieved courses
      if (resParsed.courses.length > 0) {
        setCourses(resParsed.courses);

        setSelectedCourseId(resParsed.courses[0].id);
      }
    } catch (e) {
      console.error("error fetching courses", e);
    }
  }

  async function handleInitiateCurriculum() {
    try {
      //addCurriculum action call
      const res = await addCurriculum(selectedCourseId);
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
    <Modal
      opened={opened}
      onClose={() => {
        close();
        fetchCurriculums();
      }}
      title="Müfredat Ekle"
      centered
    >
      <Stack>
        <form
          onSubmit={(e) => {
            e?.preventDefault();
            handleInitiateCurriculum();
          }}
        >
          <Group>
            <NativeSelect
              label="Dersi Seçiniz"
              value={selectedCourseId.toString()}
              onChange={(event) =>
                setSelectedCourseId(parseInt(event.currentTarget.value))
              }
              disabled={!courses.length || isCurriculumInitiated}
              data={courses.map((course) => {
                return {
                  label: course.name,
                  value: course.id.toString(),
                  //set it to disabled if course is legacy,
                  //or if the course has another curriculum that is not legacy.
                  disabled: course.legacy || !course.curriculums[0].legacy,
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
                <ActionIcon type="submit" variant="outline">
                  <IconPlus size={16} />
                </ActionIcon>
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
