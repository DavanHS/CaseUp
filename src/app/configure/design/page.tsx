interface PageProps {
  searchParams: {
    [key: string]: String | String[] | undefined;
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const { id } = await searchParams;
  return <p>{id}</p>;
};

export default Page;
