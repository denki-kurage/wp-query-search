import { Button } from "@wordpress/components";
import { createContext, useContext } from "@wordpress/element";
import React from "react";

export enum TaskStatus
{
    waiting,
    running,
    faulted,
    succeeded,
    canceled
}

export interface ICancellation
{
    cancel(): void;
}

export class AbortControllerCancellation implements ICancellation
{
    public constructor(private readonly abortController: AbortController){ }

    public cancel(): void
    {
        this.abortController.abort();    
    }
}

export class Task<T>
{
    private _status: TaskStatus = TaskStatus.waiting;
    private _result?: T;
    private _error: any;
    protected readonly onStatusChanged: (status: TaskStatus) => void;

    public get status()
    {
        return this._status;
    }

    public get isCompleted()
    {
        const f = [TaskStatus.succeeded, TaskStatus.faulted, TaskStatus.canceled];
        return f.includes(this._status);
    }

    public get result()
    {
        return this._result;
    }

    public get error()
    {
        return this._error;
    }

    public get hasCancellation()
    {
        return !!this.cancellation;
    }

    public constructor(
        private readonly promise: Promise<T>,
        private readonly cancellation?: ICancellation)
    {

    }

    public async run()
    {
        if(this._status === TaskStatus.waiting)
        {
            this.changeStatus(TaskStatus.running);

            try
            {
                this._result = await this.promise;
                this.changeStatus(TaskStatus.succeeded);
            }
            catch(ex)
            {
                this._error = ex;
                this.changeStatus(TaskStatus.faulted);
            }
        }
    }

    public cancel()
    {
        if(this._status === TaskStatus.running)
        {
            this.changeStatus(TaskStatus.canceled);
            this.cancellation?.cancel();
        }
    }


    private changeStatus(status: TaskStatus)
    {
        this._status = status;
    }
}

export type TaskFactory<T> = () => Task<T>







export interface ITaskDisposable
{
    dispose(): void;
}

export interface IAsyncDialogProps extends ITaskDisposable
{
    executeCommand: () => void;
    cancelCommand?: () => void;

    isExecuting: boolean;
    cancelled: boolean;
    error?: any;
    result?: any;
}

export interface IReusableDialogProps extends IAsyncDialogProps
{
    retryCommand: () => void;
    retryCount: number;
}








const AsyncDialogContext= createContext<IAsyncDialogProps>({} as any);
export const AsyncDialogContextProvider = AsyncDialogContext.Provider;
export const useAsyncDialogContext = () => useContext(AsyncDialogContext);


export type AsyncDialogProps =
{
	enabled?: boolean;
	report?: any;
    children: any;
}

export const AsyncDialog = (props: AsyncDialogProps) =>
{
	const { isExecuting } = useAsyncDialogContext();
	const { report, enabled, children } = props;

	return (
		<div>

            <div>
                {children}
            </div>
            
			<div>
				{ isExecuting ? <AsyncDialogReport report={report} /> : <AsyncDialogMessage {...props} /> }
			</div>

			<ul>
				<li>
					<AsyncDialogExecuteButton enabled={enabled} />
				</li>
				<li>
					<AsyncDialogCancelButton />
				</li>
			</ul>
		</div>
	)
}


export const AsyncDialogReport = ({ report }) =>
{
	return (
		<div>
			{ report && <h2>Loading...</h2> }
			{ report && <>{report?.toString()}</> }
		</div>
	)
}

export const AsyncDialogMessage = (props: AsyncDialogProps) =>
{
	const { cancelled, error } = useAsyncDialogContext();

	return (
		<div>
			{ error && <h2>{error?.toString() ?? 'エラー'}</h2> }
			{ cancelled && <h2>キャンセルされました</h2> }
		</div>
	)
}

export const AsyncDialogExecuteButton = ({enabled}) =>
{
	const { executeCommand, isExecuting } = useAsyncDialogContext();

    const disabled = !enabled || isExecuting;

	return (
		<Button disabled={disabled} onClick={executeCommand}>
            実行する
        </Button>
	)
}

export const AsyncDialogCancelButton = () =>
{
	const { cancelCommand, isExecuting } = useAsyncDialogContext();

	return (
	    <>{ cancelCommand && <Button disabled={isExecuting} onClick={cancelCommand}>キャンセル</Button> }</>
	)
}




