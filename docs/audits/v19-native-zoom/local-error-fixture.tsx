'use client';
import {useState} from 'react';
import ErrorView from '../error';
export default function LocalErrorFixture(){const [done,setDone]=useState(false);return done?<main className="container page" id="main"><h1>로컬 오류 화면 검증을 마쳤습니다.</h1></main>:<ErrorView reset={()=>setDone(true)}/>;}
