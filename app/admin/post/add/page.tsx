import { Hooks } from '@/hooks';

export default function Home() {
  return (
    <>
        <div className='container md:px-6 px-2'>
            <div className='flex md:flex-row flex-col'>
                <div className='w-full md:w-2/3'>
                    <div>
                        <h1>
                            title
                        </h1>
                        <input type="text" placeholder='title' className='p-2 outline-0 border w-full' />
                    </div>
                    <Hooks name="From-left" />
                </div>
                <div className='w-full md:w-1/3'>
                    <Hooks name="Nex-footer" />
                </div>
            </div>
        </div>
    </>
  );
}