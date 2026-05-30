import { BookAuth } from "./book-auth";

export default async function LoginPage(props: PageProps<"/login">) {
  const { error } = await props.searchParams;
  return <BookAuth hasError={!!error} />;
}
