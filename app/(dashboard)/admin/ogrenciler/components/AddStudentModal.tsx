import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import {
  Stack,
  Group,
  Modal,
  TextInput,
  NativeSelect,
  Checkbox,
  Button,
} from "@mantine/core";
import auth from "firebase.init.js";
import addStudent from "../actions/addStudent";
import { sendSignInLinkToEmail } from "firebase/auth";

type FormValues = { firstName: string; lastName: string; email: string };

//create zod schema
const schema = z.object({
  firstName: z
    .string()
    .min(1, { message: "İsim zorunludur." })
    .max(100, { message: "İsim 100 karakterden uzun olamaz." }),
  lastName: z
    .string()
    .min(1, { message: "Soyisim zorunludur." })
    .max(100, { message: "Soyisim 100 karakterden uzun olamaz." }),
  email: z
    .string()
    .min(1, { message: "Email zorunludur." })
    .max(150, { message: "Email 150 karakterden uzun olamaz." })
    .email("Email formatı hatalı."),
});

//modal component to add a student
export default function AddStudentModal({
  opened,
  close,
  fetchStudents,
}: {
  opened: boolean;
  close: () => void;
  fetchStudents: () => Promise<void>;
}) {
  //array of periods fetched from API
  const [periods, setPeriods] = useState<
    { id: number; beginsAt: Date; endsAt: Date; courseName: string }[]
  >([]);

  //if true, period will be set for the added student in database
  const [isPeriodSet, setIsPeriodSet] = useState(false);

  //to pass into addStudent action
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);

  //mantine form initialization
  const form = useForm<FormValues>({
    initialValues: { firstName: "", lastName: "", email: "" },
    validate: zodResolver(schema),
  });

  useEffect(() => {
    fetchPeriods();
  }, []);

  async function fetchPeriods() {
    try {
      const res = await fetch("ogrenciler/api/getPeriods", { method: "GET" });
      const resParsed = await res.json();

      if (!res.ok) {
        //error returned from api
        console.error(resParsed.error);
        return;
      }

      //set periods array state based on retrieved periods
      if (resParsed.periods.length > 0) {
        setPeriods(
          resParsed.periods.map(
            (period: {
              id: number;
              begins_at: Date;
              ends_at: Date;
              curriculum: { course: { name: string } };
            }) => {
              return {
                id: period.id,
                beginsAt: period.begins_at,
                endsAt: period.ends_at,
                courseName: period.curriculum.course.name,
              };
            },
          ),
        );
      }
    } catch (e) {
      console.error("error fetching periods", e);
    }
  }

  //add student form handler
  async function handleAddStudent(values: FormValues) {
    try {
      //addStudent action call
      const res = await addStudent(
        values.email,
        values.firstName,
        values.lastName,
        selectedPeriodId ? selectedPeriodId : undefined,
      );

      if (!res.success) {
        //error returned from addStudent action
        console.error(res.error);
        //show error in form
        form.setFieldError("email", res.error);
        return;
      }
    } catch (e) {
      console.error("unknown error addStudent", e);

      //show error in form
      form.setFieldError(
        "email",
        "Sunucuyla iletişimde bir hata oluştu. Tekrar deneyin.",
      );
      return;
    }

    //firebase config object
    const actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase Console.
      url: "http://localhost:3000",
      // This must be true.
      handleCodeInApp: true,
    };

    try {
      //send the email link for the student to sign up
      await sendSignInLinkToEmail(auth, values.email, actionCodeSettings);
    } catch (e: any) {
      console.error(
        "firebase error sendSignInLinkToEmail",
        //error returned from firebase
        e.message ? e.message : e,
      );
      //show error in form
      form.setFieldError(
        "email",
        "Davet linki gönderilirken bir hata oluştu, fakat veritabanında kullanıcı oluşturuldu. Lütfen formu kapatın ve yeni kullanıcı oluşturmadan varolan kullanıcıya yeni link gönderin.",
      );
      return;
    }
    //successful

    //close the modal
    close();
    //re-fetch students
    fetchStudents();
  }

  //call this function to show the date in correct format
  const getPeriodDate = (periodDate: Date) => {
    const months = [
      "Ocak",
      "Şub",
      "Mart",
      "Nis",
      "May",
      "Haz",
      "Tem",
      "Ağus",
      "Eyl",
      "Ekim",
      "Kas",
      "Ara",
    ];

    const date = new Date(periodDate);

    return date.getDate() + " " + months[date.getMonth()];
  };

  return (
    <Modal opened={opened} onClose={close} title="Öğrenci Ekle" centered>
      <form
        onSubmit={form.onSubmit((values, e) => {
          e?.preventDefault();
          //validate the form, form.errors will be set if validation fails
          form.validate();
          //if valid, continue
          if (form.isValid()) handleAddStudent(values);
        })}
      >
        <Stack>
          <Group wrap="nowrap">
            <TextInput label="İsim" {...form.getInputProps("firstName")} />
            <TextInput label="Soyisim" {...form.getInputProps("lastName")} />
          </Group>

          <TextInput label="Email" {...form.getInputProps("email")} />

          <Checkbox
            checked={isPeriodSet}
            onChange={(e) => setIsPeriodSet(e.currentTarget.checked)}
            label="Dönem şimdi seçilsin mi?"
          />

          <NativeSelect
            label="Dönemi Seçiniz"
            value={selectedPeriodId ? selectedPeriodId.toString() : undefined}
            onChange={(event) =>
              setSelectedPeriodId(parseInt(event.currentTarget.value))
            }
            disabled={!periods.length || !isPeriodSet}
            data={periods.map((period) => {
              return {
                label:
                  getPeriodDate(period.beginsAt) +
                  " - " +
                  getPeriodDate(period.endsAt) +
                  ": " +
                  period.courseName,
                value: period.id.toString(),
              };
            })}
          />

          <Button
            type="submit"
            disabled={
              !form.values.firstName ||
              !form.values.lastName ||
              !form.values.email
            }
          >
            Öğrenci Ekle
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
