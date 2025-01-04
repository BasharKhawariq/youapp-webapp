export async function POST(req) {
  const { email, password } = await req.json();

  try {
    const response = await axios.post("https://techtest.youapp.ai/api/login", {
      email,
      username: email, // Asumsikan username sama dengan email
      password,
    });

    const result = response.data; // Akses data dari respons

    if (response.status === 201) {
      cookies().set("token", result.access_token, {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60, // 7 hari
      });

      return new Response(
        JSON.stringify({ message: result.message || "Login Successful", user: result.user }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ message: result.message || "Login failed" }),
        { status: 400 }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Something went wrong. Please try again later." }),
      { status: 500 }
    );
  }
}
