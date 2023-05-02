import {
  component$,
  useSignal,
  useStylesScoped$,
  useTask$,
} from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import {
  routeLoader$,
  Form,
  routeAction$,
  server$,
} from '@builder.io/qwik-city';
import STYLES from './index.css?inline';

import { useAuthSession, useAuthSignout } from '~/routes/plugin@auth';
import { useAuthSignin } from '~/routes/plugin@auth';
export const useDadJoke = routeLoader$(async () => {
  const response = await fetch('https://icanhazdadjoke.com/', {
    headers: { Accept: 'application/json' },
  });
  return (await response.json()) as {
    id: string;
    status: number;
    joke: string;
  };
});
export const head: DocumentHead = {
  title: 'Joke',
  meta: [
    {
      name: 'description',
      content: 'Qwik site description',
    },
  ],
};

const useJokeVoteAction = routeAction$((props) => {
  console.log('VOTE', props);
});

export default component$(() => {
  const session = useAuthSession();
  const signOut = useAuthSignout();
  const signIn = useAuthSignin();
  useStylesScoped$(STYLES);
  const isFavoriteSignal = useSignal(false);
  // Calling our `useDadJoke` hook, will return a reactive signal to the loaded data.
  const dadJokeSignal = useDadJoke();
  const favoriteJokeAction = useJokeVoteAction();
  useTask$(({ track }) => {
    track(() => isFavoriteSignal.value);
    console.log('FAVORITE (isomorphic)', isFavoriteSignal.value);
    server$(() => {
      console.log('FAVORITE (server)', isFavoriteSignal.value);
    })();
  });
  return (
    <section class="section bright">
      <p>{dadJokeSignal.value.joke}</p>
      <Form action={favoriteJokeAction}>
        <input type="hidden" name="jokeID" value={dadJokeSignal.value.id} />
        <button name="vote" value="up">
          👍
        </button>
        <button name="vote" value="down">
          👎
        </button>
      </Form>
      <button
        onClick$={() => (isFavoriteSignal.value = !isFavoriteSignal.value)}
      >
        {isFavoriteSignal.value ? '❤️' : '🤍'}
      </button>
      {session.value ? (
        <Form action={signOut}>
          <input type="hidden" name="callbackUrl" value="/joke" />
          <button>Sign Out</button>
        </Form>
      ) : (
        <Form action={signIn}>
          <input type="hidden" name="providerId" value="github" />
          <input type="hidden" name="options.callbackUrl" value="/joke" />
          <button>Sign In</button>
        </Form>
      )}
      <p>{session.value?.user?.email}</p>
    </section>
  );
});
