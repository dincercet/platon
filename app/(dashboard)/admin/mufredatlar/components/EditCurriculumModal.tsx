import { useMemo, useState } from "react";
import {
  rem,
  Stack,
  Center,
  Radio,
  Button,
  Modal,
  Textarea,
  Accordion,
  ActionIcon,
} from "@mantine/core";
import { IconPlus, IconEdit } from "@tabler/icons-react";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import addCurriculumWeek from "../actions/addCurriculumWeek";
import editCurriculumWeek from "../actions/editCurriculumWeek";

type WeekFormValues = {
  weekNo: number;
  weekDescription: string;
};

//validate weekForm via zod
const weekSchema = z.object({
  weekDescription: z
    .string()
    .min(1, { message: "Hafta açıklaması zorunludur." })
    .max(500, { message: "Hafta açıklaması 500 karakterden uzun olamaz." }),
});

export default function EditCurriculumModal({
  opened,
  close,
  fetchCurriculums,
  curriculum,
}: {
  opened: boolean;
  close: () => void;
  fetchCurriculums: () => Promise<void>;

  curriculum: {
    curriculumId: number;
    createdAt: Date;
    courseName: string;
    weeks: { weekId: number; weekNo: number; weekDescription: string }[];
  };
}) {
  //array of weeks within curriculum
  const [curriculumWeeks, setCurriculumWeeks] = useState<
    typeof curriculum.weeks
  >(curriculum.weeks);

  //weekId of selected week to pass into editCurriculumWeek action
  const [selectedWeekId, setSelectedWeekId] = useState(0);

  //index of curriculumWeeks array that will be edited
  const [editWeekIndex, setEditWeekIndex] = useState(0);

  //to choose between edit or add form submission
  const [isEdit, setIsEdit] = useState(false);

  //whether the form will be shown or not
  const [isWeekFormActive, setIsWeekFormActive] = useState(false);

  //to control radio buttons
  const [selectedWeekValue, setSelectedWeekValue] = useState("");

  //mantine form hook
  const weekForm = useForm<WeekFormValues>({
    initialValues: { weekNo: 1, weekDescription: "" },
    validate: zodResolver(weekSchema),
  });

  //construct the title of the modal and keep the computed result between re-renders
  const title = useMemo(() => {
    const months = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];

    const date = new Date(curriculum.createdAt);

    return (
      date.getDate() +
      " " +
      months[date.getMonth()] +
      ": " +
      curriculum.courseName
    );
  }, [curriculum]);

  async function handleEditWeek(values: WeekFormValues) {
    try {
      //editCurriculumWeek action call
      const res = await editCurriculumWeek(
        selectedWeekId,
        values.weekDescription,
      );

      if (!res.success) {
        //error returned from editCurriculumWeek action
        console.error(res.error);
        return;
      }
    } catch (e) {
      console.error("unknown error editCurriculumWeek", e);
      return;
    }

    //update the curriculumWeeks array and re-render Accordion
    setCurriculumWeeks(
      curriculumWeeks.map((week, index) => {
        //update the week object matching the index
        if (index === editWeekIndex)
          return { ...week, weekDescription: values.weekDescription };
        else return week;
      }),
    );

    //form back to initial state
    weekForm.reset();

    //unmount the form
    setIsWeekFormActive(false);

    //reset the radio group
    setSelectedWeekValue("");
  }

  async function handleAddWeek(values: WeekFormValues) {
    let res;
    try {
      //addCurriculumWeek action call
      res = await addCurriculumWeek(
        curriculum.curriculumId,
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

    if (res.weekId) {
      //add new week to curriculumWeeks array and re-render Accordion
      setCurriculumWeeks([
        ...curriculumWeeks,
        {
          weekId: res.weekId,
          weekNo: values.weekNo,
          weekDescription: values.weekDescription,
        },
      ]);

      //form back to initial state
      weekForm.reset();

      //unmount the form
      setIsWeekFormActive(false);

      //reset the radio group
      setSelectedWeekValue("");
    }
  }

  const weekList = curriculumWeeks.map((week, index) => {
    return (
      <Accordion.Item key={week.weekId} value={week.weekNo.toString()}>
        <Center>
          <Radio
            value={week.weekNo.toString()}
            mr={rem(8)}
            onClick={() => {
              //to pass to the editCurriculumWeek action
              setSelectedWeekId(week.weekId);
              //to update the weeks array on form submision
              setEditWeekIndex(index);
              //to choose between edit or add when submitting form
              setIsEdit(true);
              //fill the form values accordingly
              weekForm.setFieldValue("weekNo", week.weekNo);
              weekForm.setFieldValue("weekDescription", week.weekDescription);
            }}
          />
          <Accordion.Control>{week.weekNo + ". Hafta"}</Accordion.Control>
        </Center>
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
      title={title}
      centered
    >
      <Stack>
        <Button
          leftSection={<IconPlus size={16} />}
          mb={rem(8)}
          onClick={() => {
            //set weekNo to incremented value of the last week in curriculum (if there are any weeks)
            if (curriculumWeeks.length)
              weekForm.setFieldValue(
                "weekNo",
                curriculumWeeks.slice(-1)[0].weekNo + 1,
              );
            //flush the weekDescription
            weekForm.setFieldValue("weekDescription", "");
            //render the form
            setIsWeekFormActive(true);
            //to choose between edit or add when submitting form
            setIsEdit(false);
            //reset the radio group
            setSelectedWeekValue("");
          }}
        >
          Hafta Ekle
        </Button>

        {
          //if there are any weeks in the curriculum
          //show the list of weeks
          weekList.length > 0 && (
            <Accordion>
              <Radio.Group
                value={selectedWeekValue}
                onChange={(e) => {
                  setSelectedWeekValue(e);
                }}
              >
                {weekList}
              </Radio.Group>
            </Accordion>
          )
        }
        {
          //Edit Button
          //if there are any weeks and form is not rendered, show button
          //otherwise there is no need for this button.
          weekList.length > 0 && !isWeekFormActive && (
            <Button
              variant="outline"
              //if no week is selected, disable the button
              disabled={selectedWeekValue === ""}
              mt={rem(8)}
              onClick={() => {
                //render the form
                setIsWeekFormActive(true);
              }}
            >
              <IconEdit />
            </Button>
          )
        }

        {
          //single form for both editing and adding a week to the curriculum.
          isWeekFormActive && (
            <form
              onSubmit={weekForm.onSubmit((values, e) => {
                e?.preventDefault();
                //validate the form, form.errors will be set if validation fails
                weekForm.validate();
                //if valid, continue
                if (weekForm.isValid())
                  //choose between edit or add submission
                  isEdit ? handleEditWeek(values) : handleAddWeek(values);
              })}
            >
              <Textarea
                placeholder={
                  weekForm.values.weekNo + ". Hafta Derslerinin Açıklaması"
                }
                label={weekForm.values.weekNo + ". Hafta"}
                rightSection={
                  <ActionIcon type="submit" variant="outline">
                    {isEdit ? <IconEdit size={16} /> : <IconPlus size={16} />}
                  </ActionIcon>
                }
                autosize
                minRows={3}
                {...weekForm.getInputProps("weekDescription")}
              />
            </form>
          )
        }
      </Stack>
    </Modal>
  );
}
