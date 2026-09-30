import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useParams } from 'wouter';
import { useUser } from '@clerk/react';
import {
  ArrowLeft,
  ArrowUpRight,
  CornerDownRight,
  LockKeyhole,
  Send,
} from 'lucide-react';
import {
  getGetConversationQueryKey,
  getListMessagesQueryKey,
  useCreateMessage,
  useGetConversation,
  useListMessages,
  useReplyToMessage,
} from '@workspace/api-client-react';
import type { ConversationReply, OwnerConversation } from '@workspace/api-client-react';
import { PortfolioShell } from '@/pages/PortfolioPages';

function errorCopy(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <header className="archive-masthead page-masthead">
      <p className="portfolio-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="archive-subtitle">{copy}</p>
    </header>
  );
}

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const createMessage = useCreateMessage();
  const [, setLocation] = useLocation();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const result = await createMessage.mutateAsync({
        data: { name: name.trim(), email: email.trim(), body: body.trim() },
      });
      setLocation(`/conversation/${encodeURIComponent(result.token)}`);
    } catch (cause) {
      setError(errorCopy(cause));
    }
  };

  return (
    <PortfolioShell active="contact">
      <PageIntro eyebrow="Contact / Private note" title="Write a message." copy="A direct line to Abdul. Send a note here and return to the private link to read any reply." />
      <div className="archive-meta contact-meta">
        <span>Correspondence / <strong>Private link</strong></span>
        <span>Replies appear on this page</span>
      </div>
      <section className="contact-page-layout" aria-label="Send Abdul a message">
        <aside className="contact-side-note">
          <span className="contact-index">01 / OPEN LINE</span>
          <h2>Keep your conversation link.</h2>
          <p>After sending, this site gives you a private page for the conversation. Save that link so you can come back and check for a reply.</p>
          <div className="private-note"><LockKeyhole size={15} aria-hidden="true" /><span>No email alerts are sent. The link is how you return.</span></div>
          <a href="https://instagram.com/abdul1l1l1" target="_blank" rel="noreferrer" className="contact-social-link" data-testid="link-contact-instagram">
            Instagram <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </aside>
        <form className="portfolio-form contact-form-page" onSubmit={submit} data-testid="form-contact">
          <div className="form-fields-row">
            <label><span>Your name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" autoComplete="name" required maxLength={100} data-testid="input-contact-name" /></label>
            <label><span>Your email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required maxLength={180} data-testid="input-contact-email" /></label>
          </div>
          <label><span>Message</span><textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="What would you like to talk about?" rows={7} required maxLength={2000} data-testid="input-contact-message" /></label>
          {error && <p className="conversation-error" role="alert" data-testid="status-contact-error">{error}</p>}
          <div className="contact-submit-row">
            <p>Your details stay with this private conversation.</p>
            <button type="submit" className="portfolio-button" disabled={createMessage.isPending} data-testid="button-send-message">
              {createMessage.isPending ? 'Sending…' : 'Send message'} <Send size={14} aria-hidden="true" />
            </button>
          </div>
        </form>
      </section>
    </PortfolioShell>
  );
}

function ReplyForm({ conversationId, onReplied }: { conversationId: string; onReplied: () => void }) {
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const reply = useReplyToMessage();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await reply.mutateAsync({ id: conversationId, data: { body: body.trim() } });
      setBody('');
      onReplied();
    } catch (cause) {
      setError(errorCopy(cause));
    }
  };

  return (
    <form className="reply-form" onSubmit={submit} data-testid={`form-reply-${conversationId}`}>
      <label htmlFor={`reply-${conversationId}`}>Write a reply</label>
      <textarea id={`reply-${conversationId}`} value={body} onChange={(event) => setBody(event.target.value)} rows={3} maxLength={2000} required placeholder="Your reply will appear in the visitor's private link." data-testid={`input-reply-${conversationId}`} />
      {error && <p className="conversation-error" role="alert">{error}</p>}
      <button className="portfolio-button" type="submit" disabled={reply.isPending} data-testid={`button-send-reply-${conversationId}`}>
        {reply.isPending ? 'Sending…' : 'Send reply'} <CornerDownRight size={14} aria-hidden="true" />
      </button>
    </form>
  );
}

function ConversationThread({ conversation, owner = false, onReplied }: { conversation: OwnerConversation; owner?: boolean; onReplied: () => void }) {
  return (
    <article className="thread-record" data-testid={`conversation-${conversation.id}`}>
      <header className="thread-record-head">
        <div><span className="thread-label">From / {conversation.name}</span><time>{new Date(conversation.createdAt).toLocaleString()}</time></div>
        {owner && <a href={`mailto:${conversation.email}`} className="thread-email">{conversation.email}</a>}
      </header>
      <div className="thread-message">{conversation.body}</div>
      {conversation.replies.map((reply: ConversationReply, index) => (
        <div className="thread-reply" key={reply.id} data-testid={`reply-${reply.id}`}>
          <div className="thread-label">Abdul / Reply {String(index + 1).padStart(2, '0')} <time>{new Date(reply.createdAt).toLocaleString()}</time></div>
          <p>{reply.body}</p>
        </div>
      ))}
      {owner && <ReplyForm conversationId={conversation.id} onReplied={onReplied} />}
    </article>
  );
}

export function MessagesPage() {
  const { isLoaded, isSignedIn } = useUser();
  const queryClient = useQueryClient();
  const { data: conversations, isLoading, isError, error, refetch } = useListMessages({
    query: { enabled: isLoaded && !!isSignedIn, queryKey: getListMessagesQueryKey() },
  });

  const refreshArchive = () => {
    void queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey() });
  };

  return (
    <PortfolioShell active="archive">
      <PageIntro eyebrow="Owner only / Correspondence" title="Message archive." copy="Every message sent through Contact is saved here, newest first. Open this page any time to read and reply." />
      <div className="archive-meta"><span>Received messages / <strong>Owner only</strong></span><span>{isSignedIn && conversations ? `${conversations.length} saved conversation${conversations.length === 1 ? '' : 's'}` : 'Replies stay on the visitor link'}</span></div>
      {!isLoaded ? <div className="message-skeleton" aria-label="Loading account"><i /><i /><i /></div> : !isSignedIn ? (
        <section className="private-gate"><LockKeyhole size={18} aria-hidden="true" /><h2>Owner sign-in required.</h2><p>This archive is private. Sign in with the owner account to view received messages.</p><Link className="portfolio-button" href="/sign-in" data-testid="link-archive-sign-in">Owner sign in <ArrowUpRight size={14} aria-hidden="true" /></Link></section>
      ) : isLoading ? (
        <div className="message-skeleton" aria-label="Loading messages"><i /><i /><i /></div>
      ) : isError ? (
        <section className="inbox-state" role="alert"><p className="portfolio-eyebrow">Archive unavailable</p><h2>Messages could not be loaded.</h2><p>{errorCopy(error)}</p><button className="portfolio-button" onClick={() => void refetch()} type="button" data-testid="button-retry-archive">Try again</button></section>
      ) : !conversations?.length ? (
        <section className="inbox-state inbox-empty"><p className="portfolio-eyebrow">No correspondence yet</p><h2>The archive is quiet.</h2><p>New notes sent from Contact will be saved here automatically.</p><Link href="/contact" className="text-link" data-testid="link-archive-contact">View contact page <ArrowUpRight size={14} aria-hidden="true" /></Link></section>
      ) : (
        <section className="conversation-list" aria-label="Received message archive">
          {conversations.map((conversation) => <ConversationThread key={conversation.id} conversation={conversation} owner onReplied={refreshArchive} />)}
        </section>
      )}
    </PortfolioShell>
  );
}

export function VisitorConversationPage() {
  const { token = '' } = useParams<{ token: string }>();
  const { data: conversation, isLoading, isError, error, refetch } = useGetConversation(token, {
    query: { enabled: !!token, queryKey: getGetConversationQueryKey(token) },
  });

  return (
    <PortfolioShell active="contact">
      <div className="conversation-back"><Link href="/contact" className="text-link" data-testid="link-conversation-back"><ArrowLeft size={14} aria-hidden="true" /> Contact Abdul</Link></div>
      <PageIntro eyebrow="Private correspondence" title="Your conversation." copy="This page belongs to your private link. Keep it to return and read replies." />
      <div className="archive-meta"><span>Thread / <strong>Private link</strong></span><span>Replies appear here</span></div>
      {isLoading ? <div className="message-skeleton" aria-label="Loading conversation"><i /><i /></div> : isError || !conversation ? (
        <section className="inbox-state" role="alert"><p className="portfolio-eyebrow">Link unavailable</p><h2>This conversation could not be opened.</h2><p>{isError ? errorCopy(error) : 'Check that you have the complete private link.'}</p><button className="portfolio-button" type="button" onClick={() => void refetch()} data-testid="button-retry-conversation">Try again</button></section>
      ) : (
        <section className="visitor-thread" aria-label="Your private conversation">
          <article className="thread-record">
            <header className="thread-record-head"><div><span className="thread-label">Your message</span><time>{new Date(conversation.createdAt).toLocaleString()}</time></div></header>
            <div className="thread-message">{conversation.body}</div>
            {conversation.replies.map((reply, index) => (
              <div className="thread-reply" key={reply.id} data-testid={`visitor-reply-${reply.id}`}>
                <div className="thread-label">Abdul / Reply {String(index + 1).padStart(2, '0')} <time>{new Date(reply.createdAt).toLocaleString()}</time></div>
                <p>{reply.body}</p>
              </div>
            ))}
            {!conversation.replies.length && <p className="waiting-note">No reply yet. Keep this link and return later.</p>}
          </article>
          <p className="private-note visitor-private-note"><LockKeyhole size={14} aria-hidden="true" /> Replies are posted here. No email alerts are sent.</p>
        </section>
      )}
    </PortfolioShell>
  );
}